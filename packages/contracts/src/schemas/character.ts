import { z } from 'zod'

export const CharacterCreateSchema = z.object({
  name: z.string().min(1).max(200),
  age: z.number().int().min(18).max(150).optional(),
  gender: z.string().max(50).optional(),
  personality: z.string().max(5000).optional(),
  backstory: z.string().max(20000).optional(),
  voiceStyle: z.string().max(200).optional(),
  language: z.string().max(10).default('en'),
  isTemplate: z.boolean().default(false),
})

export const CharacterUpdateSchema = CharacterCreateSchema.partial()

export type CharacterCreateSchema = z.infer<typeof CharacterCreateSchema>
export type CharacterUpdateSchema = z.infer<typeof CharacterUpdateSchema>