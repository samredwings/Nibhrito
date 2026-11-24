import type { Memory, LorebookEntry, CorpusChunk, SceneState, SessionParticipant } from '@nibhrito/contracts'

export type ContextSlot =
  | 'IDENTITY'
  | 'SCENE_STATE'
  | 'RECENT_TURNS'
  | 'ROLLING_SUMMARY'
  | 'MEMORIES'
  | 'LOREBOOK'
  | 'CORPUS'
  | 'USER_MESSAGE'

export interface ContextBlock {
  slot: ContextSlot
  text: string
  tokens: number
  sourceIds: string[]
}

export interface DroppedBlock {
  slot: ContextSlot
  reason: 'budget' | 'empty'
}

export interface ContextBundle {
  blocks: ContextBlock[]
  totalTokens: number
  dropped: DroppedBlock[]
}

export interface AssembleInput {
  character: {
    id: string
    name: string
    personality?: string | null
    backstory?: string | null
    voiceStyle?: string | null
    language: string
  }
  session: {
    id: string
    title: string
    mode: string
    summary?: string | null
  }
  sceneState?: SceneState | null
  participants: SessionParticipant[]
  recentMessages: Array<{
    role: string
    content: string
    participantName?: string
  }>
  rollingSummary?: string | null
  memories: Memory[]
  loreEntries: LorebookEntry[]
  corpusChunks: CorpusChunk[]
  userMessage: string
  intensity: number
  tokenBudget: number
}