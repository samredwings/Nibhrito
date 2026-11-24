export type Capability = 'TEXT' | 'VISION' | 'TTS' | 'STT' | 'IMAGE'

export type HealthStatus =
  | { status: 'healthy'; latencyMs: number }
  | { status: 'degraded'; latencyMs: number; reason: string }
  | { status: 'unavailable'; reason: string }

export interface ProviderConfig {
  id: string
  name: string
  adapter: string
  endpoint?: string | null
  isDefault: boolean
  isEnabled: boolean
}

export interface GenerationInput {
  model: string
  systemPrompt?: string
  messages: Array<{ role: string; content: string }>
  temperature?: number
  maxTokens?: number
}

export interface ProviderAdapter {
  id: string
  name: string
  capabilities(): readonly Capability[]
  health(): Promise<HealthStatus>
  generate(input: GenerationInput, signal?: AbortSignal): AsyncIterable<{
    type: 'delta' | 'done' | 'error'
    text?: string
    error?: { code: string; message: string; retryable: boolean }
  }>
}