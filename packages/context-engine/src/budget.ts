import type { ContextBlock, ContextSlot, DroppedBlock } from './types'

// Simple whitespace-based token estimator
export function estimateTokens(text: string): number {
  if (!text) return 0
  // Rough approximation: 1 token ~= 0.75 words for English/Bengali mix
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / 0.75)
}

const SLOT_PRIORITY: Record<ContextSlot, number> = {
  USER_MESSAGE: 1000,
  IDENTITY: 800,
  SCENE_STATE: 700,
  RECENT_TURNS: 600,
  ROLLING_SUMMARY: 500,
  MEMORIES: 400,
  LOREBOOK: 300,
  CORPUS: 200,
}

export function buildBlocksWithBudget(
  candidateBlocks: Array<{ slot: ContextSlot; text: string; sourceIds: string[] }>,
  budget: number
): { blocks: ContextBlock[]; dropped: DroppedBlock[]; remaining: number } {
  const selected = new Set<number>()
  const droppedByIndex = new Map<number, DroppedBlock>()
  let used = 0

  // Select by importance, not by incidental candidate insertion order.
  const prioritized = candidateBlocks
    .map((candidate, index) => ({ candidate, index }))
    .sort((a, b) => SLOT_PRIORITY[b.candidate.slot] - SLOT_PRIORITY[a.candidate.slot] || a.index - b.index)

  for (const { candidate, index } of prioritized) {
    const tokens = estimateTokens(candidate.text)
    if (candidate.text.trim().length === 0) {
      droppedByIndex.set(index, { slot: candidate.slot, reason: 'empty' })
      continue
    }

    // A user's current request is never silently discarded, even if it exceeds the budget.
    if (candidate.slot === 'USER_MESSAGE' || used + tokens <= budget) {
      selected.add(index)
      used += tokens
    } else {
      droppedByIndex.set(index, { slot: candidate.slot, reason: 'budget' })
    }
  }

  const blocks = candidateBlocks
    .filter((_candidate, index) => selected.has(index))
    .map((candidate) => ({
      slot: candidate.slot,
      text: candidate.text,
      tokens: estimateTokens(candidate.text),
      sourceIds: candidate.sourceIds,
    }))

  const dropped = [...droppedByIndex.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, item]) => item)

  return { blocks, dropped, remaining: Math.max(0, budget - used) }
}
