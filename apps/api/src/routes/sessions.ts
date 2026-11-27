import { asyncRouter } from '../lib/async-router'
import { prisma } from '../lib/prisma'
import {
  SessionCreateSchema,
  SessionUpdateSchema,
  ParticipantCreateSchema,
} from '@nibhrito/contracts'

const router = asyncRouter()

const select = {
  participants: { include: { character: true } },
} as const

// GET /api/sessions
router.get('/', async (_req, res) => {
  const sessions = await prisma.session.findMany({
    orderBy: { updatedAt: 'desc' },
    include: select,
  })
  res.json({ data: sessions })
})

// GET /api/sessions/:id
router.get('/:id', async (req, res) => {
  const session = await prisma.session.findUnique({
    where: { id: req.params.id },
    include: {
      ...select,
      messages: { orderBy: { createdAt: 'asc' } },
      sceneState: true,
    },
  })
  if (!session) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Session not found' })
    return
  }
  res.json({ data: session })
})

// POST /api/sessions
router.post('/', async (req, res) => {
  const input = SessionCreateSchema.parse(req.body)
  const uniqueIds = [...new Set(input.characterIds)]

  const found = await prisma.character.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, name: true },
  })
  if (found.length !== uniqueIds.length) {
    const known = new Set(found.map((character) => character.id))
    res.status(400).json({
      error: 'UNKNOWN_CHARACTER',
      message: 'One or more characters do not exist',
      details: uniqueIds.filter((id) => !known.has(id)),
    })
    return
  }

  const session = await prisma.$transaction(async (tx) => {
    const created = await tx.session.create({
      data: {
        title: input.title,
        mode: input.mode,
        language: input.language,
      },
    })
    await tx.sessionParticipant.createMany({
      data: found.map((character) => ({
        sessionId: created.id,
        characterId: character.id,
        displayName: character.name,
      })),
    })
    await tx.sceneState.create({
      data: {
        sessionId: created.id,
        presentIds: found.map((character) => character.id),
      },
    })
    return tx.session.findUniqueOrThrow({
      where: { id: created.id },
      include: { ...select, sceneState: true },
    })
  })

  res.status(201).json({ data: session })
})

// PATCH /api/sessions/:id
router.patch('/:id', async (req, res) => {
  const data = SessionUpdateSchema.parse(req.body)
  const session = await prisma.session.update({
    where: { id: req.params.id },
    data,
    include: select,
  })
  res.json({ data: session })
})

// DELETE /api/sessions/:id
router.delete('/:id', async (req, res) => {
  await prisma.session.delete({ where: { id: req.params.id } })
  res.status(204).send()
})

// POST /api/sessions/:id/participants
router.post('/:id/participants', async (req, res) => {
  const input = ParticipantCreateSchema.parse(req.body)

  const session = await prisma.session.findUnique({ where: { id: req.params.id } })
  if (!session) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Session not found' })
    return
  }

  const character = await prisma.character.findUnique({ where: { id: input.characterId } })
  if (!character) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Character not found' })
    return
  }

  try {
    const participant = await prisma.$transaction(async (tx) => {
      const created = await tx.sessionParticipant.create({
        data: {
          sessionId: session.id,
          characterId: character.id,
          displayName: input.displayName ?? character.name,
          knowledgeScope: input.knowledgeScope,
        },
        include: { character: true },
      })
      await tx.sceneState.updateMany({
        where: { sessionId: session.id },
        data: { presentIds: { push: character.id } },
      })
      return created
    })
    res.status(201).json({ data: participant })
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
      res.status(409).json({
        error: 'ALREADY_PARTICIPANT',
        message: 'That character is already in this session',
      })
      return
    }
    throw err
  }
})

// DELETE /api/sessions/:id/participants/:participantId
router.delete('/:id/participants/:participantId', async (req, res) => {
  const removed = await prisma.$transaction(async (tx) => {
    const participant = await tx.sessionParticipant.findFirst({
      where: { id: req.params.participantId, sessionId: req.params.id },
    })
    if (!participant) return false

    await tx.sessionParticipant.delete({ where: { id: participant.id } })
    const scene = await tx.sceneState.findUnique({ where: { sessionId: req.params.id } })
    if (scene) {
      await tx.sceneState.update({
        where: { sessionId: req.params.id },
        data: { presentIds: scene.presentIds.filter((id) => id !== participant.characterId) },
      })
    }
    return true
  })

  if (!removed) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Participant not found' })
    return
  }
  res.status(204).send()
})

export default router
