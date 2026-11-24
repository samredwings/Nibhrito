import { z } from 'zod'

export const SessionCreateSchema = z.object({
  title: z.string().min(1).max(300),
  mode: z.enum(['CHARACTER_FIRST', 'STORY_FIRST', 'ENSEMBLE_FIRST']),
  language: z.string().max(10).default('en'),
})

export const SessionUpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'PAUSED']).optional(),
  language: z.string().max(10).optional(),
})

export type SessionCreateSchema = z.infer<typeof SessionCreateSchema>
export type SessionUpdateSchema = z.infer<typeof SessionUpdateSchema>