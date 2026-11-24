import type { Memory, MemoryRankingInput, MemoryRankingResult } from '@nibhrito/contracts'

export function rankMemories(
  inputs: MemoryRankingInput[],
  maxResults: number
): MemoryRankingResult[] {
  const eligibleInputs = inputs.filter(({ memory, sessionId, characterId }) => {
    if (memory.scope === 'CHARACTER') return memory.characterId === characterId
    if (memory.scope === 'SESSION') return memory.sessionId === sessionId
    return true
  })

  const scored = eligibleInputs.map((input): MemoryRankingResult => {
    const memory = input.memory
    let score = 0
    const reasons: string[] = []

    // Importance base score (1-10)
    score += memory.importance * 10
    reasons.push(`importance:${memory.importance}`)

    // Recency decay for unpinned episodic memories
    if (memory.type === 'EPISODE' && !memory.isPinned) {
      const daysSinceCreation =
        (input.currentTimestamp.getTime() - new Date(memory.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
      const decayFactor = Math.max(0, 1 - daysSinceCreation / 30)
      score *= decayFactor
      reasons.push(`decay:${decayFactor.toFixed(2)}`)
    }

    // Keyword relevance (simple substring match)
    const queryWords = input.query.toLowerCase().split(/\s+/)
    const contentWords = memory.content.toLowerCase()
    let matchCount = 0
    for (const word of queryWords) {
      if (word.length > 2 && contentWords.includes(word)) {
        matchCount++
      }
    }
    if (matchCount > 0) {
      score += matchCount * 15
      reasons.push(`keyword:${matchCount}`)
    }

    // Scope relevance
    if (memory.scope === 'CHARACTER' && memory.characterId === input.characterId) {
      score += 20
      reasons.push('scope:character-match')
    } else if (memory.scope === 'SESSION' && memory.sessionId === input.sessionId) {
      score += 15
      reasons.push('scope:session-match')
    } else if (memory.scope === 'GLOBAL') {
      score += 5
      reasons.push('scope:global')
    }

    // Pinned bonus
    if (memory.isPinned) {
      score += 25
      reasons.push('pinned')
    }

    // Approved only
    if (!memory.isApproved) {
      score = 0
      reasons.push('not-approved')
    }

    return { memory, score, reasons }
  })

  // Sort by score descending, deterministic tie-break by id
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.memory.id.localeCompare(b.memory.id)
  })

  return scored.slice(0, maxResults)
}