import { describe, expect, it } from 'vitest'
import { assembleContext } from '../assembler'
import { buildBlocksWithBudget, estimateTokens } from '../budget'
import type { ContextSlot } from '../types'

const baseInput = {
  character: { id: 'char-1', name: 'Mira', language: 'en' },
  session: { id: 'session-1', title: 'A new story', mode: 'CHARACTER_FIRST' },
  sceneState: null,
  participants: [],
  recentMessages: [{ role: 'USER', content: 'First turn' }],
  memories: [],
  loreEntries: [],
  corpusChunks: [],
  userMessage: 'Continue the story',
  intensity: 5,
}

describe('assembleContext', () => {
  it('keeps the canonical slot order and places the user message last', () => {
    const result = assembleContext({ ...baseInput, tokenBudget: 4000 })
    expect(result.blocks.map((block) => block.slot)).toEqual([
      'IDENTITY', 'RECENT_TURNS', 'USER_MESSAGE',
    ])
    expect(result.blocks.at(-1)?.slot).toBe('USER_MESSAGE')
  })
})

describe('buildBlocksWithBudget', () => {
  it('drops lower-priority context before higher-priority context and always keeps the user message last', () => {
    const candidates: Array<{ slot: ContextSlot; text: string; sourceIds: string[] }> = [
      { slot: 'CORPUS', text: 'low priority story corpus with extra words', sourceIds: [] },
      { slot: 'IDENTITY', text: 'character identity', sourceIds: [] },
      { slot: 'USER_MESSAGE', text: 'user request', sourceIds: [] },
    ]
    const budget = estimateTokens(candidates[0].text) + estimateTokens(candidates[2].text)
    const result = buildBlocksWithBudget(candidates, budget)
    expect(result.blocks.map((block) => block.slot)).toEqual(['IDENTITY', 'USER_MESSAGE'])
    expect(result.dropped).toContainEqual({ slot: 'CORPUS', reason: 'budget' })
  })
})
