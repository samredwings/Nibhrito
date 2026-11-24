import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { SessionCreateSchema, SessionUpdateSchema } from '@nibhrito/contracts'
import { ZodError } from 'zod'

const router: Router = Router()

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
    const data = SessionCreateSchema.parse(req.body)
    const session = await prisma.session.create({ data })
    res.status(201).json({ data: session })
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors })
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
    if (err instanceof ZodError) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors })
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