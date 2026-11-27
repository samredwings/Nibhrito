import { describe, expect, it } from 'vitest'
import { hashLocalPin, verifyLocalPin } from '../lib/pin'

describe('local PIN hashing', () => {
  it('verifies the correct PIN using a salted scrypt hash', () => {
    const hash = hashLocalPin('482951')
    expect(hash).not.toContain('482951')
    expect(verifyLocalPin('482951', hash)).toBe(true)
  })

  it('rejects an incorrect PIN and malformed stored hashes', () => {
    const hash = hashLocalPin('482951')
    expect(verifyLocalPin('482952', hash)).toBe(false)
    expect(verifyLocalPin('482951', 'not-a-hash')).toBe(false)
  })

  it('uses a different salt for each stored PIN hash', () => {
    expect(hashLocalPin('482951')).not.toBe(hashLocalPin('482951'))
  })
})
