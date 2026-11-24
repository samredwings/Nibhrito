import type { ProviderAdapter, Capability, HealthStatus, GenerationInput } from '@nibhrito/contracts'
import { ProviderError, mapHttpStatusToError } from './errors'

export interface OllamaProviderConfig {
  baseUrl: string
  model: string
}

export function createOllamaProvider(config: OllamaProviderConfig): ProviderAdapter {
  return {
    id: 'ollama',
    name: `Ollama (${config.model})`,
    capabilities: (): readonly Capability[] => ['TEXT'],

    health: async (): Promise<HealthStatus> => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)

        const res = await fetch(`${config.baseUrl}/api/tags`, {
          signal: controller.signal,
        })
        clearTimeout(timeout)

        if (!res.ok) {
          return { status: 'unavailable', reason: `HTTP ${res.status}` }
        }

        return { status: 'healthy', latencyMs: 0 }
      } catch (err) {
        return {
          status: 'unavailable',
          reason: err instanceof Error ? err.message : 'Unknown error',
        }
      }
    },

    generate: async function* (input: GenerationInput, signal?: AbortSignal) {
      try {
        const messages = input.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }))

        if (input.systemPrompt) {
          messages.unshift({ role: 'system', content: input.systemPrompt })
        }

        const res = await fetch(`${config.baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: config.model,
            messages,
            stream: true,
            options: {
              temperature: input.temperature ?? 0.7,
              num_predict: input.maxTokens ?? 2048,
            },
          }),
          signal,
        })

        if (!res.ok) {
          const body = await res.text().catch(() => '')
          const err = mapHttpStatusToError(res.status, body)
          yield {
            type: 'error' as const,
            error: { code: err.code, message: err.message, retryable: err.retryable },
          }
          return
        }

        const reader = res.body?.getReader()
        if (!reader) {
          yield {
            type: 'error' as const,
            error: { code: 'INTERNAL', message: 'No response body', retryable: false },
          }
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          if (signal?.aborted) {
            reader.cancel()
            return
          }

          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.trim()) continue
            try {
              const chunk = JSON.parse(line)
              if (chunk.message?.content) {
                yield { type: 'delta' as const, text: chunk.message.content }
              }
              if (chunk.error) {
                yield {
                  type: 'error' as const,
                  error: { code: 'INTERNAL', message: chunk.error, retryable: false },
                }
                return
              }
            } catch {
              // Ignore malformed JSON lines in stream
            }
          }
        }

        yield { type: 'done' as const }
      } catch (err) {
        if (err instanceof ProviderError) {
          yield {
            type: 'error' as const,
            error: { code: err.code, message: err.message, retryable: err.retryable },
          }
          return
        }
        const message = err instanceof Error ? err.message : 'Unknown error'
        yield {
          type: 'error' as const,
          error: { code: 'NETWORK', message, retryable: true },
        }
      }
    },
  }
}