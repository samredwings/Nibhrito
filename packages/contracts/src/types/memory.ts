export type MemoryType = 'FACT' | 'EPISODE' | 'RELATIONSHIP' | 'WORLD'
export type MemoryScope = 'GLOBAL' | 'SESSION' | 'CHARACTER'

export interface Memory {
  id: string
  characterId?: string | null
  sessionId?: string | null
  type: MemoryType
  content: string
  importance: number
  scope: MemoryScope
  isPinned: boolean
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MemoryCreateInput {
  characterId?: string
  sessionId?: string
  type: MemoryType
  content: string
  importance?: number
  scope?: MemoryScope
  isPinned?: boolean
  isApproved?: boolean
}

export interface MemoryRankingInput {
  memory: Memory
  sessionId: string
  characterId?: string
  query: string
  currentTimestamp: Date
}

export interface MemoryRankingResult {
  memory: Memory
  score: number
  reasons: string[]
}
export type MemoryUpdateInput = Partial<MemoryCreateInput>
