import type { AppErrorCode, MessageRole, ReplyMeta } from './chat'

export interface Message {
  id: string
  sessionId: string
  participantId?: string | null
  role: MessageRole
  content: string
  provider?: string | null
  model?: string | null
  latencyMs?: number | null
  createdAt: Date
}

export interface SendMessageInput {
  sessionId: string
  participantId?: string
  content: string
  intensity?: number
}

export interface SendMessageResult {
  userMessage: Message
  assistantMessage?: Message
  error?: {
    code: AppErrorCode
    retryable: boolean
    message: string
  }
  meta?: ReplyMeta
}