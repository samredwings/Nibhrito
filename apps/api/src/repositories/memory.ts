import { prisma } from '../lib/prisma'
import type { Memory, MemoryCreateInput } from '@nibhrito/contracts'

export const memoryRepository = {
  async findBySession(sessionId: string): Promise<Memory[]> {
    return prisma.memory.findMany({
      where: {
        OR: [{ sessionId }, { scope: 'GLOBAL' }],
      },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    }) as unknown as Memory[]
  },

  async findByCharacter(characterId: string): Promise<Memory[]> {
    return prisma.memory.findMany({
      where: {
        OR: [{ characterId }, { scope: 'GLOBAL' }],
      },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    }) as unknown as Memory[]
  },

  async create(data: MemoryCreateInput): Promise<Memory> {
    return prisma.memory.create({ data }) as unknown as Memory
  },

  async delete(id: string): Promise<Memory> {
    return prisma.memory.delete({ where: { id } }) as unknown as Memory
  },
}