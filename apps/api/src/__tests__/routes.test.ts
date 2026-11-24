import { afterAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'
import { prisma } from '../lib/prisma'

const app = createApp()

afterAll(async () => { await prisma.$disconnect() })

describe('API routes', () => {
  it('mounts local auth on API routes in production mode', async () => {
    const previous = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      const response = await request(app).get('/api/providers/health')
      expect(response.status).toBe(401)
      expect(response.body).toEqual({ error: 'UNAUTHORIZED', message: 'PIN required' })
    } finally {
      if (previous === undefined) delete process.env.NODE_ENV
      else process.env.NODE_ENV = previous
    }
  })

  it('returns the health payload', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ status: 'ok' })
  })

  it('returns the standard not-found shape', async () => {
    const response = await request(app).get('/not-a-route')
    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'NOT_FOUND', message: 'Endpoint not found' })
  })

  it('returns the validation error shape for malformed character input', async () => {
    const response = await request(app).post('/api/characters').send({ name: '' })
    expect(response.status).toBe(400)
    expect(response.body.error).toBe('VALIDATION_ERROR')
    expect(response.body.message).toBe('Invalid request data')
    expect(response.body.details).toBeInstanceOf(Array)
  })

  it('validates memory payloads before any database write', async () => {
    const response = await request(app).post('/api/memories').send({ content: '' })
    expect(response.status).toBe(400)
    expect(response.body.error).toBe('VALIDATION_ERROR')
  })

  it('validates lorebook payloads before any database write', async () => {
    const response = await request(app).post('/api/lorebook').send({ keywords: '', content: '' })
    expect(response.status).toBe(400)
    expect(response.body.error).toBe('VALIDATION_ERROR')
  })
})
