import { afterAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'
import { prisma } from '../lib/prisma'
const app = createApp()
const enabled = Boolean(process.env.DATABASE_URL)
const suffix = 'integration-' + Date.now()
describe.skipIf(!enabled)('character to chat persistence integration', () => {
 let characterId: string | undefined
 let sessionId: string | undefined
 afterAll(async () => { if (sessionId) await prisma.session.deleteMany({ where: { id: sessionId } }); if (characterId) await prisma.character.deleteMany({ where: { id: characterId } }); await prisma.$disconnect() })
 it('creates a character, attaches it, chats, and reloads history', async () => {
  const c = await request(app).post('/api/characters').send({ name: 'Nibhrito ' + suffix, age: 28 }).expect(201); characterId = c.body.data.id
  const s = await request(app).post('/api/sessions').send({ title: 'Session ' + suffix, mode: 'CHARACTER_FIRST', characterIds: [characterId] }).expect(201); sessionId = s.body.data.id
  const p = s.body.data.participants[0]; expect(p.characterId).toBe(characterId)
  const m = await request(app).post('/api/messages/session/' + sessionId).send({ content: 'Introduce yourself.', participantId: p.id }).expect(201)
  expect(m.body.data.assistantMessage.content).toBeTruthy()
  const reload = await request(createApp()).get('/api/sessions/' + sessionId).expect(200)
  expect(reload.body.data.participants).toHaveLength(1); expect(reload.body.data.messages).toHaveLength(2)
 })
})
