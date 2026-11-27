import { Router } from 'express'
import { z, ZodError } from 'zod'
import { prisma } from '../lib/prisma'
import { SessionCreateSchema, SessionUpdateSchema } from '@nibhrito/contracts'

const router: Router = Router()

const CreateSessionInputSchema = SessionCreateSchema.extend({
  characterIds: z.array(z.string().uuid()).max(12).optional(),
}).superRefine((value, context) => {
  if (value.characterIds && new Set(value.characterIds).size !== value.characterIds.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['characterIds'],
      message: 'A character can only be attached once to a session.',
    })
  }
})

const CreateParticipantSchema = z.object({
  characterId: z.string().uuid(),
  displayName: z.string().trim().min(1).max(200).optional(),
  knowledgeScope: z.string().trim().min(1).max(100).default('ALL'),
})

// GET /api/sessions
router.get('/', async (_req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { participants: { include: { character: true } } },
    })
    res.json({ data: sessions })
  } catch (err) {
    console.error('Failed to fetch sessions:', err)
    res.status(500).json({ error: 'FETCH_FAILED', message: 'Could not fetch sessions' })
  }
})

// GET /api/sessions/:sessionId/participants
router.get('/:sessionId/participants', async (req, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.sessionId },
      select: { id: true },
    })
    if (!session) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Session not found' })
      return
    }
    const participants = await prisma.sessionParticipant.findMany({
      where: { sessionId: session.id },
      include: { character: true },
      orderBy: { id: 'asc' },
    })
    res.json({ data: participants })
  } catch (err) {
    console.error('Failed to fetch session participants:', err)
    res.status(500).json({ error: 'FETCH_FAILED', message: 'Could not fetch session participants' })
  }
})

// POST /api/sessions/:sessionId/participants
router.post('/:sessionId/participants', async (req, res) => {
  try {
    const data = CreateParticipantSchema.parse(req.body)
    const session = await prisma.session.findUnique({
      where: { id: req.params.sessionId },
      select: { id: true },
    })
    if (!session) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Session not found' })
      return
    }
    const character = await prisma.character.findUnique({
      where: { id: data.characterId },
      select: { id: true, name: true },
    })
    if (!character) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Character not found' })
      return
    }

    const participant = await prisma.sessionParticipant.create({
      data: {
        sessionId: session.id,
        characterId: character.id,
        displayName: data.displayName ?? character.name,
        knowledgeScope: data.knowledgeScope,
      },
      include: { character: true },
    })
    res.status(201).json({ data: participant })
  } catch (err) {
    if (err instanceof ZodError || (err instanceof Error && err.name === 'ZodError')) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err instanceof ZodError ? err.errors : (err as Error & { errors?: unknown[] }).errors ?? [],
      })
      return
    }
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
      res.status(409).json({ error: 'ALREADY_ATTACHED', message: 'Character is already attached to this session.' })
      return
    }
    console.error('Failed to add session participant:', err)
    res.status(500).json({ error: 'CREATE_FAILED', message: 'Could not add session participant' })
  }
})

// DELETE /api/sessions/:sessionId/participants/:participantId
router.delete('/:sessionId/participants/:participantId', async (req, res) => {
  try {
    const deleted = await prisma.sessionParticipant.deleteMany({
      where: { id: req.params.participantId, sessionId: req.params.sessionId },
    })
    if (deleted.count === 0) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Session participant not found' })
      return
    }
    res.status(204).send()
  } catch (err) {
    console.error('Failed to remove session participant:', err)
    res.status(500).json({ error: 'DELETE_FAILED', message: 'Could not remove session participant' })
  }
})

// GET /api/sessions/:id
router.get('/:id', async (req, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: {
        participants: { include: { character: true } },
        messages: { orderBy: { createdAt: 'asc' } },
        sceneState: true,
      },
    })

    if (!session) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Session not found' })
      return
    }

    res.json({ data: session })
  } catch (err) {
    console.error('Failed to fetch session:', err)
    res.status(500).json({ error: 'FETCH_FAILED', message: 'Could not fetch session' })
  }
})

// POST /api/sessions
router.post('/', async (req, res) => {
  try {
    const data = CreateSessionInputSchema.parse(req.body)
    const characterIds = data.characterIds ?? []
    const characters = characterIds.length
      ? await prisma.character.findMany({ where: { id: { in: characterIds } } })
      : []

    if (characters.length !== characterIds.length) {
      res.status(404).json({ error: 'CHARACTER_NOT_FOUND', message: 'One or more selected characters were not found.' })
      return
    }

    const session = await prisma.session.create({
      data: {
        title: data.title,
        mode: data.mode,
        language: data.language,
        participants: {
          create: characters.map((character) => ({
            displayName: character.name,
            knowledgeScope: 'ALL',
            character: { connect: { id: character.id } },
          })),
        },
      },
      include: { participants: { include: { character: true } } },
    })
    res.status(201).json({ data: session })
  } catch (err) {
    if (err instanceof ZodError || (err instanceof Error && err.name === 'ZodError')) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err instanceof ZodError ? err.errors : (err as Error & { errors?: unknown[] }).errors ?? [],
      })
      return
    }
    console.error('Failed to create session:', err)
    res.status(500).json({ error: 'CREATE_FAILED', message: 'Could not create session' })
  }
})

// PATCH /api/sessions/:id
router.patch('/:id', async (req, res) => {
  try {
    const data = SessionUpdateSchema.parse(req.body)
    const session = await prisma.session.update({
      where: { id: req.params.id },
      data,
    })
    res.json({ data: session })
  } catch (err) {
    if (err instanceof ZodError || (err instanceof Error && err.name === 'ZodError')) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err instanceof ZodError ? err.errors : (err as Error & { errors?: unknown[] }).errors ?? [],
      })
      return
    }
    console.error('Failed to update session:', err)
    res.status(500).json({ error: 'UPDATE_FAILED', message: 'Could not update session' })
  }
})

// DELETE /api/sessions/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.session.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    console.error('Failed to delete session:', err)
    res.status(500).json({ error: 'DELETE_FAILED', message: 'Could not delete session' })
  }
})

export default router
