import { z } from 'zod'

export const MemoryCreateSchema = z.object({
  characterId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  type: z.enum(['FACT', 'EPISODE', 'RELATIONSHIP', 'WORLD']),
  content: z.string().min(1).max(10000),
  importance: z.number().int().min(1).max(10).default(5),
  scope: z.enum(['GLOBAL', 'SESSION', 'CHARACTER']).default('GLOBAL'),
  isPinned: z.boolean().default(false),
  isApproved: z.boolean().default(true),
})

export type MemoryCreateSchema = z.infer<typeof MemoryCreateSchema>
export const MemoryUpdateSchema = MemoryCreateSchema.partial()
export type MemoryUpdateSchemaType = z.infer<typeof MemoryUpdateSchema>
