import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHuggingFaceProvider } from '../huggingface'
import { createOpenRouterProvider } from '../openrouter'

const input = { model: 'ignored-by-config', messages: [{ role: 'user', content: 'Hello' }] }
afterEach(() => { vi.unstubAllGlobals() })

async function readResponse(provider: ReturnType<typeof createHuggingFaceProvider>) {
  const events = []
  for await (const event of provider.generate(input)) events.push(event)
  return events
}

describe('OpenAI-compatible recorded provider fixtures', () => {
  it('parses a recorded Hugging Face SSE response without a live network call', async () => {
    const fixture = readFileSync(resolve(process.cwd(), '../../fixtures/providers/huggingface/chat-completion.sse'), 'utf8')
    const fetchMock = vi.fn().mockResolvedValue(new Response(fixture, { status: 200, headers: { 'content-type': 'text/event-stream' } }))
    vi.stubGlobal('fetch', fetchMock)
    const provider = createHuggingFaceProvider({ apiKey: 'fixture-token', model: 'test/model' })
    const events = await readResponse(provider)
    expect(events.map((event) => event.type)).toEqual(['delta', 'delta', 'done'])
    expect(events.filter((event) => event.type === 'delta').map((event) => event.text).join('')).toBe('Hello from Hugging Face.')
    expect(fetchMock.mock.calls[0][0]).toBe('https://router.huggingface.co/v1/chat/completions')
  })

  it('maps HTTP rate-limit responses to the shared typed provider error', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('rate limited', { status: 429 }))
    vi.stubGlobal('fetch', fetchMock)
    const provider = createOpenRouterProvider({ apiKey: 'fixture-token', model: 'test/model' })
    const events = await readResponse(provider)
    expect(events).toEqual([{ type: 'error', error: { code: 'QUOTA', message: 'Rate limit exceeded', retryable: true } }])
  })

  it('parses a recorded OpenRouter SSE response and sends its optional app headers', async () => {
    const fixture = readFileSync(resolve(process.cwd(), '../../fixtures/providers/openrouter/chat-completion.sse'), 'utf8')
    const fetchMock = vi.fn().mockResolvedValue(new Response(fixture, { status: 200, headers: { 'content-type': 'text/event-stream' } }))
    vi.stubGlobal('fetch', fetchMock)
    const provider = createOpenRouterProvider({ apiKey: 'fixture-token', model: 'test/model', siteUrl: 'https://example.test', appName: 'Nibhrito Test' })
    const events = await readResponse(provider)
    expect(events.filter((event) => event.type === 'delta').map((event) => event.text).join('')).toBe('Hello from OpenRouter.')
    const requestInit = fetchMock.mock.calls[0][1] as RequestInit
    expect(new Headers(requestInit.headers).get('HTTP-Referer')).toBe('https://example.test')
    expect(new Headers(requestInit.headers).get('X-Title')).toBe('Nibhrito Test')
  })
})
