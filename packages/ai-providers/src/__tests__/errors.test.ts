import { describe, expect, it } from 'vitest'
import { mapHttpStatusToError, redact } from '../errors'

describe('mapHttpStatusToError', () => {
  it('never echoes the upstream body into the message', () => {
    const error = mapHttpStatusToError(400, 'invalid key sk-live-abcdefghijklmnopqrstuvwxyz')
    expect(error.code).toBe('BAD_INPUT')
    expect(error.message).toBe('The provider rejected the request')
  })

  it('maps an auth failure to a non-retryable refusal', () => {
    const error = mapHttpStatusToError(401, '')
    expect(error.code).toBe('REFUSED')
    expect(error.retryable).toBe(false)
  })
})

describe('redact', () => {
  it('removes key-shaped values from log summaries', () => {
    expect(redact('provider rejected sk-live-abcdefghijklmnopqrstuvwxyz')).toBe(
      'provider rejected [REDACTED]'
    )
    expect(redact(`authorization: Bearer ${'a'.repeat(48)}`)).toBe(
      'authorization: [REDACTED]'
    )
  })

  it('keeps log summaries to the first 80 characters', () => {
    expect(redact('x'.repeat(100))).toHaveLength(80)
  })
})
