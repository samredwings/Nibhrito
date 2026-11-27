import { asyncRouter } from '../lib/async-router'
import { prisma } from '../lib/prisma'
import { LorebookEntryCreateSchema, LorebookEntryUpdateSchema } from '@nibhrito/contracts'
import { ZodError } from 'zod'

const router = asyncRouter()

function sendError(res: import('express').Response, err: unknown, operation: string): void {
  if (err instanceof ZodError || (err instanceof Error && err.name === 'ZodError')) {
    const details = err instanceof ZodError ? err.errors : (err as Error & { errors?: unknown[] }).errors ?? []
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid request data', details })
    return
  }
  if (err && typeof err === 'object' && 'code' in err && err.code === 'P2025') {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Lorebook entry not found' })
    return
  }
  console.error(`Failed to ${operation} lorebook entry:`, err)
  res.status(500).json({ error: 'LOREBOOK_OPERATION_FAILED', message: `Could not ${operation} lorebook entry` })
}

router.get('/', async (_req, res) => {
  try {
    const entries = await prisma.lorebookEntry.findMany({ orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }] })
    res.json({ data: entries })
  } catch (err) { sendError(res, err, 'fetch') }
})

router.post('/', async (req, res) => {
  try {
    const data = LorebookEntryCreateSchema.parse(req.body)
    const entry = await prisma.lorebookEntry.create({ data })
    res.status(201).json({ data: entry })
  } catch (err) { sendError(res, err, 'create') }
})

router.patch('/:id', async (req, res) => {
  try {
    const data = LorebookEntryUpdateSchema.parse(req.body)
    const entry = await prisma.lorebookEntry.update({ where: { id: req.params.id }, data })
    res.json({ data: entry })
  } catch (err) { sendError(res, err, 'update') }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.lorebookEntry.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) { sendError(res, err, 'delete') }
})

export default router
