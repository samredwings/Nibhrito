import { prisma } from '../lib/prisma'
import type { Session, SessionCreateInput, SessionUpdateInput } from '@nibhrito/contracts'

export const sessionRepository = {
  async findAll(): Promise<Session[]> {
    return prisma.session.findMany({ orderBy: { updatedAt: 'desc' } }) as unknown as Session[]
  },

  async findById(id: string): Promise<Session | null> {
    return prisma.session.findUnique({ where: { id } }) as unknown as Session | null
  },

  async create(data: SessionCreateInput): Promise<Session> {
    return prisma.session.create({ data }) as unknown as Session
  },

  async update(id: string, data: SessionUpdateInput): Promise<Session> {
    return prisma.session.update({ where: { id }, data }) as unknown as Session
  },

  async delete(id: string): Promise<Session> {
    return prisma.session.delete({ where: { id } }) as unknown as Session
  },
}