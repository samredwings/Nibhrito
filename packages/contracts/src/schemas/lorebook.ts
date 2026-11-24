import { z } from 'zod'

export const LorebookEntryCreateSchema = z.object({
  keywords: z.string().min(1).max(2000),
  content: z.string().min(1).max(20000),
  priority: z.number().int().min(0).max(10).default(5),
  scope: z.string().min(1).max(100).default('GLOBAL'),
  isEnabled: z.boolean().default(true),
})

export const LorebookEntryUpdateSchema = LorebookEntryCreateSchema.partial()
export type LorebookEntryCreateSchemaType = z.infer<typeof LorebookEntryCreateSchema>
export type LorebookEntryUpdateSchemaType = z.infer<typeof LorebookEntryUpdateSchema>
