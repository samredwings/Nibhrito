import { Router } from 'express'
import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { MemoryCreateSchema, MemoryUpdateSchema } from '@nibhrito/contracts'
import { ZodError } from 'zod'

const router: Router = Router()

function sendError(res: import('express').Response, err: unknown, operation: string): void {
  if (err instanceof ZodError || (err instanceof Error && err.name === 'ZodError')) {
    const details = err instanceof ZodError ? err.errors : (err as Error & { errors?: unknown[] }).errors ?? []
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid request data', details })
    return
  }
  if (err && typeof err === 'object' && 'code' in err && err.code === 'P2025') {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Memory not found' })
    return
  }
  console.error(`Failed to ${operation} memory:`, err)
  res.status(500).json({ error: 'MEMORY_OPERATION_FAILED', message: `Could not ${operation} memory` })
}

router.get('/', async (req, res) => {
  try {
    const characterId = typeof req.query.characterId === 'string' ? req.query.characterId : undefined
    const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined
    const scopeFilters: Prisma.MemoryWhereInput[] = [{ scope: 'GLOBAL' }]
    if (characterId) scopeFilters.push({ scope: 'CHARACTER', characterId })
    if (sessionId) scopeFilters.push({ scope: 'SESSION', sessionId })
    const memories = await prisma.memory.findMany({
      where: characterId || sessionId ? { OR: scopeFilters } : {},
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    })
    res.json({ data: memories })
  } catch (err) { sendError(res, err, 'fetch') }
})

router.post('/', async (req, res) => {
  try {
    const data = MemoryCreateSchema.parse(req.body)
    const memory = await prisma.memory.create({ data })
    res.status(201).json({ data: memory })
  } catch (err) { sendError(res, err, 'create') }
})

router.patch('/:id', async (req, res) => {
  try {
    const data = MemoryUpdateSchema.parse(req.body)
    const memory = await prisma.memory.update({ where: { id: req.params.id }, data })
    res.json({ data: memory })
  } catch (err) { sendError(res, err, 'update') }
})

router.post('/:id/approve', async (req, res) => {
  try {
    const memory = await prisma.memory.update({ where: { id: req.params.id }, data: { isApproved: true } })
    res.json({ data: memory })
  } catch (err) { sendError(res, err, 'approve') }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.memory.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) { sendError(res, err, 'delete') }
})

export default router
