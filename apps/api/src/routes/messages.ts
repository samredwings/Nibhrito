import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { ports } from '../lib/ports'
import { assembleContext, compactSummary } from '@nibhrito/context-engine'
import { SendMessageSchema } from '@nibhrito/contracts'
import type { ScenePhase, SceneState } from '@nibhrito/contracts'
import { ZodError } from 'zod'

const router: Router = Router()
const SUMMARY_MESSAGE_THRESHOLD = 24
const SUMMARY_RECENT_WINDOW = 12
const SUMMARY_MAX_LENGTH = 4000

function isScenePhase(value: string): value is ScenePhase {
  return value === 'INTRO' || value === 'BUILD' || value === 'INTIMATE' || value === 'CLIMAX' || value === 'AFTERCARE'
}

function mapSceneState(scene: { id: string; sessionId: string; location: string | null; timeOfDay: string | null; phase: string; intensity: number; presentIds: string[] } | null): SceneState | null {
  if (!scene) return null
  return { ...scene, phase: isScenePhase(scene.phase) ? scene.phase : 'INTRO' }
}

// GET /api/sessions/:sessionId/messages
router.get('/session/:sessionId', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { sessionId: req.params.sessionId },
      orderBy: { createdAt: 'asc' },
    })
    res.json({ data: messages })
  } catch (err) {
    console.error('Failed to fetch messages:', err)
    res.status(500).json({ error: 'FETCH_FAILED', message: 'Could not fetch messages' })
  }
})

// POST /api/sessions/:sessionId/messages
router.post('/session/:sessionId', async (req, res) => {
  try {
    const input = SendMessageSchema.parse({
      ...req.body,
      sessionId: req.params.sessionId,
    })

    // Fetch session with participants and character
    const session = await prisma.session.findUnique({
      where: { id: input.sessionId },
      include: {
        participants: { include: { character: true } },
        sceneState: true,
      },
    })

    if (!session) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Session not found' })
      return
    }

    // Determine target character (first participant if not specified)
    const targetParticipant = input.participantId
      ? session.participants.find((p) => p.id === input.participantId)
      : session.participants[0]

    if (!targetParticipant) {
      res.status(400).json({ error: 'NO_PARTICIPANT', message: 'No valid participant found' })
      return
    }

    const character = targetParticipant.character

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        sessionId: input.sessionId,
        role: 'USER',
        content: input.content,
      },
    })

    // Fetch recent messages (last 12)
    const recentMessages = await prisma.message.findMany({
      where: { sessionId: input.sessionId },
      orderBy: { createdAt: 'desc' },
      take: 12,
    })

    const orderedMessages = recentMessages.reverse().map((m) => ({
      role: m.role,
      content: m.content,
      participantName: m.participantId
        ? session.participants.find((p) => p.id === m.participantId)?.displayName
        : undefined,
    }))

    // Fetch memories
    const memories = await prisma.memory.findMany({
      where: {
        OR: [
          { characterId: character.id },
          { sessionId: input.sessionId },
          { scope: 'GLOBAL' },
        ],
      },
    })

    // Fetch lorebook
    const loreEntries = await prisma.lorebookEntry.findMany({
      where: { isEnabled: true },
    })

    // Assemble context
    const contextBundle = assembleContext({
      character: {
        id: character.id,
        name: character.name,
        personality: character.personality,
        backstory: character.backstory,
        voiceStyle: character.voiceStyle,
        language: character.language,
      },
      session: {
        id: session.id,
        title: session.title,
        mode: session.mode,
        summary: session.summary,
      },
      sceneState: mapSceneState(session.sceneState),
      participants: session.participants,
      recentMessages: orderedMessages,
      memories,
      loreEntries,
      corpusChunks: [], // TODO: implement corpus retrieval
      userMessage: input.content,
      intensity: input.intensity ?? 5,
      tokenBudget: 4000,
    })

    // Build prompt from context
    const systemPrompt = contextBundle.blocks
      .filter((b) => b.slot !== 'USER_MESSAGE')
      .map((b) => b.text)
      .join('\n\n')

    const startTime = Date.now()

    // Generate response
    const generationController = new AbortController()
    const abortIncompleteRequest = () => {
      if (!req.complete) generationController.abort()
    }
    const abortDisconnectedResponse = () => {
      if (!res.writableEnded) generationController.abort()
    }
    req.on('close', abortIncompleteRequest)
    res.on('close', abortDisconnectedResponse)

    const stream = ports.provider.generate(
      {
        model: 'default',
        systemPrompt,
        messages: [{ role: 'user', content: input.content }],
        temperature: 0.7,
        maxTokens: 1024,
      },
      generationController.signal
    )

    let assistantContent = ''
    let errorOccurred: { code: string; message: string; retryable: boolean } | null = null

    for await (const event of stream) {
      if (event.type === 'delta' && event.text) {
        assistantContent += event.text
      } else if (event.type === 'error' && event.error) {
        errorOccurred = event.error
        break
      }
    }

    const latencyMs = Date.now() - startTime
    req.off('close', abortIncompleteRequest)
    res.off('close', abortDisconnectedResponse)

    if (generationController.signal.aborted) return

    if (errorOccurred) {
      res.status(503).json({
        error: errorOccurred.code,
        message: errorOccurred.message,
        retryable: errorOccurred.retryable,
        data: { userMessage },
      })
      return
    }

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        sessionId: input.sessionId,
        participantId: targetParticipant.id,
        role: 'ASSISTANT',
        content: assistantContent,
        provider: ports.provider.id,
        model: 'default',
        latencyMs,
      },
    })

    // Recompute the deterministic rolling summary once a session grows beyond the recent-turn window.
    try {
      const messageCount = await prisma.message.count({ where: { sessionId: input.sessionId } })
      if (messageCount > SUMMARY_MESSAGE_THRESHOLD) {
        const olderMessages = await prisma.message.findMany({
          where: { sessionId: input.sessionId },
          orderBy: { createdAt: 'asc' },
          take: messageCount - SUMMARY_RECENT_WINDOW,
        })
        const summary = compactSummary({
          messagesToSummarize: olderMessages.map((message) => ({ role: message.role, content: message.content })),
          maxLength: SUMMARY_MAX_LENGTH,
        })
        await prisma.session.update({ where: { id: input.sessionId }, data: { summary: summary.summary } })
      }
    } catch (summaryError) {
      console.error('Failed to update rolling session summary:', summaryError)
    }

    res.status(201).json({
      data: {
        userMessage,
        assistantMessage,
        meta: {
          provider: ports.provider.id,
          model: 'default',
          latencyMs,
          dataLeftDevice: ports.provider.id !== 'fake',
          injectedMemoryIds: contextBundle.blocks
            .find((b) => b.slot === 'MEMORIES')
            ?.sourceIds ?? [],
          injectedLoreIds: contextBundle.blocks
            .find((b) => b.slot === 'LOREBOOK')
            ?.sourceIds ?? [],
        },
      },
    })
  } catch (err) {
    if (err instanceof ZodError || (err instanceof Error && err.name === 'ZodError')) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid request data', details: err instanceof ZodError ? err.errors : (err as Error & { errors?: unknown[] }).errors ?? [] })
      return
    }
    console.error('Failed to send message:', err)
    res.status(500).json({ error: 'SEND_FAILED', message: 'Could not send message' })
  }
})

export default router