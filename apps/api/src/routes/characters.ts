import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { CharacterCreateSchema, CharacterUpdateSchema } from '@nibhrito/contracts'
import { ZodError } from 'zod'

const router: Router = Router()

// GET /api/characters
router.get('/', async (_req, res) => {
  try {
    const characters = await prisma.character.findMany({
      orderBy: { updatedAt: 'desc' },
    })
    res.json({ data: characters })
  } catch (err) {
    console.error('Failed to fetch characters:', err)
    res.status(500).json({ error: 'FETCH_FAILED', message: 'Could not fetch characters' })
  }
})

// GET /api/characters/:id
router.get('/:id', async (req, res) => {
  try {
    const character = await prisma.character.findUnique({
      where: { id: req.params.id },
      include: { visualProfile: true },
    })

    if (!character) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Character not found' })
      return
    }

    res.json({ data: character })
  } catch (err) {
    console.error('Failed to fetch character:', err)
    res.status(500).json({ error: 'FETCH_FAILED', message: 'Could not fetch character' })
  }
})

// POST /api/characters
router.post('/', async (req, res) => {
  try {
    const data = CharacterCreateSchema.parse(req.body)
    const character = await prisma.character.create({ data })
    res.status(201).json({ data: character })
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors })
      return
    }
    console.error('Failed to create character:', err)
    res.status(500).json({ error: 'CREATE_FAILED', message: 'Could not create character' })
  }
})

// PATCH /api/characters/:id
router.patch('/:id', async (req, res) => {
  try {
    const data = CharacterUpdateSchema.parse(req.body)
    const character = await prisma.character.update({
      where: { id: req.params.id },
      data,
    })
    res.json({ data: character })
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors })
      return
    }
    console.error('Failed to update character:', err)
    res.status(500).json({ error: 'UPDATE_FAILED', message: 'Could not update character' })
  }
})

// DELETE /api/characters/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.character.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    console.error('Failed to delete character:', err)
    res.status(500).json({ error: 'DELETE_FAILED', message: 'Could not delete character' })
  }
})

export default router