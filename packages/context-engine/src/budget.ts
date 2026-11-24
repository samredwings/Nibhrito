import type { ContextBlock, ContextSlot, DroppedBlock } from './types'

// Simple whitespace-based token estimator
export function estimateTokens(text: string): number {
  if (!text) return 0
  // Rough approximation: 1 token ~= 0.75 words for English/Bengali mix
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / 0.75)
}

export function buildBlocksWithBudget(
  candidateBlocks: Array<{ slot: ContextSlot; text: string; sourceIds: string[] }>,
  budget: number
): { blocks: ContextBlock[]; dropped: DroppedBlock[]; remaining: number } {
  const blocks: ContextBlock[] = []
  const dropped: DroppedBlock[] = []
  let used = 0

  for (const candidate of candidateBlocks) {
    const tokens = estimateTokens(candidate.text)
    if (used + tokens <= budget && candidate.text.trim().length > 0) {
      blocks.push({
        slot: candidate.slot,
        text: candidate.text,
        tokens,
        sourceIds: candidate.sourceIds,
      })
      used += tokens
    } else {
      if (candidate.text.trim().length === 0) {
        dropped.push({ slot: candidate.slot, reason: 'empty' })
      } else {
        dropped.push({ slot: candidate.slot, reason: 'budget' })
      }
    }
  }

  return { blocks, dropped, remaining: budget - used }
}