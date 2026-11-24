import { describe, expect, it } from 'vitest'
import { rankMemories } from '../ranking'
import type { Memory, MemoryRankingInput } from '@nibhrito/contracts'

const now = new Date('2026-11-24T00:00:00.000Z')
function memory(overrides: Partial<Memory> = {}): Memory {
  return { id: 'memory-1', type: 'FACT', content: 'A quiet garden', importance: 5, scope: 'GLOBAL', isPinned: false, isApproved: true, createdAt: now, updatedAt: now, ...overrides }
}
function input(item: Memory, overrides: Partial<MemoryRankingInput> = {}): MemoryRankingInput {
  return { memory: item, sessionId: 'session-1', characterId: 'character-1', query: '', currentTimestamp: now, ...overrides }
}

describe('rankMemories', () => {
  it('ranks a pinned memory above an otherwise equivalent unpinned memory', () => {
    const result = rankMemories([input(memory({ id: 'unpinned' })), input(memory({ id: 'pinned', isPinned: true }))], 2)
    expect(result[0].memory.id).toBe('pinned')
  })

  it('reduces the score of an older unpinned episodic memory', () => {
    const recent = memory({ id: 'recent', type: 'EPISODE', createdAt: now })
    const old = memory({ id: 'old', type: 'EPISODE', createdAt: new Date(now.getTime() - 15 * 86400000) })
    const result = rankMemories([input(old), input(recent)], 2)
    expect(result.find((item) => item.memory.id === 'old')!.score).toBeLessThan(result.find((item) => item.memory.id === 'recent')!.score)
  })

  it('does not return character-scoped memories belonging to another character', () => {
    const own = memory({ id: 'own', scope: 'CHARACTER', characterId: 'character-1' })
    const other = memory({ id: 'other', scope: 'CHARACTER', characterId: 'character-2' })
    const result = rankMemories([input(own), input(other)], 10)
    expect(result.map((item) => item.memory.id)).toEqual(['own'])
  })

  it('uses memory id as a deterministic tie-breaker', () => {
    const result = rankMemories([input(memory({ id: 'z' })), input(memory({ id: 'a' }))], 2)
    expect(result.map((item) => item.memory.id)).toEqual(['a', 'z'])
  })
})
