import { prisma } from '../lib/prisma'
import type { Character, CharacterCreateInput, CharacterUpdateInput } from '@nibhrito/contracts'

export const characterRepository = {
  async findAll(): Promise<Character[]> {
    return prisma.character.findMany({ orderBy: { updatedAt: 'desc' } })
  },

  async findById(id: string): Promise<Character | null> {
    return prisma.character.findUnique({ where: { id } })
  },

  async create(data: CharacterCreateInput): Promise<Character> {
    return prisma.character.create({ data })
  },

  async update(id: string, data: CharacterUpdateInput): Promise<Character> {
    return prisma.character.update({ where: { id }, data })
  },

  async delete(id: string): Promise<Character> {
    return prisma.character.delete({ where: { id } })
  },
}