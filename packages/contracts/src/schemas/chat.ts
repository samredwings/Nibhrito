import { z } from 'zod'

export const SendMessageInput = z.object({
  sessionId: z.string().uuid(),
  participantId: z.string().uuid().optional(),
  content: z.string().trim().min(1).max(20000),
  intensity: z.number().int().min(1).max(10).default(5),
})

export type SendMessageInput = z.infer<typeof SendMessageInput>