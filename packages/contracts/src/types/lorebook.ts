export interface LorebookEntry {
  id: string
  keywords: string
  content: string
  priority: number
  scope: string
  isEnabled: boolean
  createdAt: Date
}

export interface LorebookTriggerResult {
  entry: LorebookEntry
  matchedKeywords: string[]
  relevanceScore: number
}