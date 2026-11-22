export type StreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'done'; messageId: string; provider: string; model: string; latencyMs: number; dataLeftDevice: boolean }
  | { type: 'error'; code: AppErrorCode; retryable: boolean; message: string }
  | { type: 'heartbeat' }

export type AppErrorCode =
  | 'QUOTA'
  | 'ASLEEP'
  | 'REFUSED'
  | 'TIMEOUT'
  | 'NETWORK'
  | 'BAD_INPUT'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'INTERNAL'

export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM'

export interface ReplyMeta {
  provider: string
  model: string
  latencyMs: number
  dataLeftDevice: boolean
  injectedMemoryIds: string[]
  injectedLoreIds: string[]
}