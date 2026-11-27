import { z } from 'zod'

export const SessionCreateSchema = z.object({
  title: z.string().min(1).max(300),
  mode: z.enum(['CHARACTER_FIRST', 'STORY_FIRST', 'ENSEMBLE_FIRST']),
  language: z.string().max(10).default('en'),
  // A session without characters cannot be chatted with, so the cast is
  // required at creation time rather than patched in afterwards.
  characterIds: z.array(z.string().uuid()).min(1).max(8),
})

export const SessionUpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'PAUSED']).optional(),
  language: z.string().max(10).optional(),
})

export const ParticipantCreateSchema = z.object({
  characterId: z.string().uuid(),
  displayName: z.string().min(1).max(120).optional(),
  knowledgeScope: z.enum(['ALL', 'SESSION_ONLY']).default('ALL'),
})

export type SessionCreateSchema = z.infer<typeof SessionCreateSchema>
export type SessionUpdateSchema = z.infer<typeof SessionUpdateSchema>
export type ParticipantCreateInput = z.infer<typeof ParticipantCreateSchema>
