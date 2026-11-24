import type { LorebookEntry, LorebookTriggerResult } from '@nibhrito/contracts'

export function triggerLorebook(
  entries: LorebookEntry[],
  query: string,
  maxResults: number
): LorebookTriggerResult[] {
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2)

  const results: LorebookTriggerResult[] = []

  for (const entry of entries) {
    if (!entry.isEnabled) continue

    const keywords = entry.keywords.toLowerCase().split(',').map((k) => k.trim())
    const matchedKeywords: string[] = []

    for (const keyword of keywords) {
      if (keyword.length === 0) continue
      if (queryLower.includes(keyword)) {
        matchedKeywords.push(keyword)
      }
    }

    // Also check individual words for partial matches
    for (const word of queryWords) {
      for (const keyword of keywords) {
        if (keyword.includes(word) || word.includes(keyword)) {
          if (!matchedKeywords.includes(keyword)) {
            matchedKeywords.push(keyword)
          }
        }
      }
    }

    if (matchedKeywords.length > 0) {
      results.push({
        entry,
        matchedKeywords,
        relevanceScore: matchedKeywords.length * entry.priority,
      })
    }
  }

  // Sort by relevance score descending, then priority
  results.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore
    }
    return b.entry.priority - a.entry.priority
  })

  return results.slice(0, maxResults)
}