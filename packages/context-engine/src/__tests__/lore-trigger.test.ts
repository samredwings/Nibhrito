import { describe, expect, it } from 'vitest'
import { triggerLorebook } from '../lore-trigger'
import type { LorebookEntry } from '@nibhrito/contracts'

const entry: LorebookEntry = { id: 'lore-1', keywords: 'moon, silver forest', content: 'The forest glows under moonlight.', priority: 8, scope: 'GLOBAL', isEnabled: true, createdAt: new Date('2026-01-01T00:00:00.000Z') }

describe('triggerLorebook', () => {
  it('injects an enabled entry when a keyword is present', () => {
    const result = triggerLorebook([entry], 'They walked beneath the moon.', 5)
    expect(result).toHaveLength(1)
    expect(result[0].entry.id).toBe('lore-1')
  })

  it('does not return entries when no keyword matches', () => {
    expect(triggerLorebook([entry], 'They walked beside a river.', 5)).toEqual([])
  })
})
