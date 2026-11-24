import { describe, expect, it } from 'vitest'
import { compactSummary } from '../summary'

describe('compactSummary', () => {
  it('compacts older turns into a deterministic bounded summary', () => {
    const result = compactSummary({
      messagesToSummarize: [{ role: 'USER', content: 'They entered the garden.' }, { role: 'ASSISTANT', content: 'The gate closed behind them.' }],
      maxLength: 80,
    })
    expect(result.summary).toContain('USER: They entered the garden.')
    expect(result.summary.length).toBeLessThanOrEqual(80)
    expect(result.tokens).toBeGreaterThan(0)
  })
})
