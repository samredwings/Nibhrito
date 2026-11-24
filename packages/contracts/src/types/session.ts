export type SessionMode = 'CHARACTER_FIRST' | 'STORY_FIRST' | 'ENSEMBLE_FIRST'
export type SessionStatus = 'ACTIVE' | 'ARCHIVED' | 'PAUSED'

export interface Session {
  id: string
  title: string
  mode: SessionMode
  status: SessionStatus
  language: string
  summary?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SessionCreateInput {
  title: string
  mode: SessionMode
  language?: string
}

export interface SessionUpdateInput {
  title?: string
  status?: SessionStatus
  language?: string
}

export interface SessionParticipant {
  id: string
  sessionId: string
  characterId: string
  displayName: string
  knowledgeScope: string
}

export interface SessionWithParticipants extends Session {
  participants: SessionParticipant[]
}