import { describe, expect, it } from 'vitest'
import { createFakeProvider } from '../fake'

const input = { model: 'fake', messages: [{ role: 'user', content: 'Hello' }] }

describe('createFakeProvider', () => {
  it('emits response deltas followed by done', async () => {
    const provider = createFakeProvider({ delayMs: 0, fixedResponse: 'hello world' })
    const events = []
    for await (const event of provider.generate(input)) events.push(event)
    expect(events.map((event) => event.type)).toEqual(['delta', 'delta', 'done'])
    expect(events.filter((event) => event.type === 'delta').map((event) => event.text).join('')).toBe('hello world')
  })

  it('emits a typed error when configured to fail', async () => {
    const provider = createFakeProvider({ shouldError: 'QUOTA' })
    const events = []
    for await (const event of provider.generate(input)) events.push(event)
    expect(events).toEqual([{ type: 'error', error: { code: 'QUOTA', message: 'Simulated QUOTA error', retryable: true } }])
  })

  it('does not emit a delayed delta if aborted while waiting', async () => {
    const provider = createFakeProvider({ delayMs: 40, fixedResponse: 'one two three' })
    const controller = new AbortController()
    const iterator = provider.generate(input, controller.signal)[Symbol.asyncIterator]()
    const pending = iterator.next()
    setTimeout(() => controller.abort(), 5)
    const first = await pending
    expect(first.done).toBe(true)
  })
})
