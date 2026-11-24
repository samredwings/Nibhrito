import { prisma } from '../lib/prisma'
import type { Message } from '@nibhrito/contracts'

export const messageRepository = {
  async findBySession(sessionId: string, skip = 0, take = 100): Promise<Message[]> {
    return prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      skip,
      take,
    }) as unknown as Message[]
  },

  async create(data: {
    sessionId: string
    participantId?: string
    role: string
    content: string
    provider?: string
    model?: string
    latencyMs?: number
  }): Promise<Message> {
    return prisma.message.create({ data }) as unknown as Message
  },
}