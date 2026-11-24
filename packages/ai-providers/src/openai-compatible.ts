import type { ProviderAdapter, Capability, HealthStatus, GenerationInput } from '@nibhrito/contracts'
import { mapHttpStatusToError } from './errors'

export interface OpenAICompatibleProviderConfig {
  id: string
  name: string
  baseUrl: string
  apiKey: string
  model: string
  extraHeaders?: Record<string, string>
}

function providerUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/chat/completions`
}

export function createOpenAICompatibleProvider(config: OpenAICompatibleProviderConfig): ProviderAdapter {
  return {
    id: config.id,
    name: config.name,
    capabilities: (): readonly Capability[] => ['TEXT'],

    health: async (): Promise<HealthStatus> => {
      const startedAt = Date.now()
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      try {
        const response = await fetch(`${config.baseUrl.replace(/\/+$/, '')}/models`, {
          headers: { Authorization: `Bearer ${config.apiKey}`, ...config.extraHeaders },
          signal: controller.signal,
        })
        if (!response.ok) return { status: 'unavailable', reason: `HTTP ${response.status}` }
        return { status: 'healthy', latencyMs: Date.now() - startedAt }
      } catch (error) {
        return { status: 'unavailable', reason: error instanceof Error ? error.message : 'Health check failed' }
      } finally {
        clearTimeout(timeout)
      }
    },

    generate: async function* (input: GenerationInput, signal?: AbortSignal) {
      try {
        const messages = input.messages.map((message) => ({ role: message.role, content: message.content }))
        if (input.systemPrompt) messages.unshift({ role: 'system', content: input.systemPrompt })

        const response = await fetch(providerUrl(config.baseUrl), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            ...config.extraHeaders,
          },
          body: JSON.stringify({
            model: config.model,
            messages,
            stream: true,
            temperature: input.temperature ?? 0.7,
            max_tokens: input.maxTokens ?? 2048,
          }),
          signal,
        })

        if (!response.ok) {
          const body = await response.text().catch(() => '')
          const providerError = mapHttpStatusToError(response.status, body)
          yield { type: 'error' as const, error: { code: providerError.code, message: providerError.message, retryable: providerError.retryable } }
          return
        }

        const reader = response.body?.getReader()
        if (!reader) {
          yield { type: 'error' as const, error: { code: 'INTERNAL', message: 'No response body', retryable: false } }
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''
        let completed = false

        while (!completed) {
          if (signal?.aborted) {
            await reader.cancel().catch(() => undefined)
            return
          }
          const chunk = await reader.read()
          if (chunk.done) break
          buffer += decoder.decode(chunk.value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue
            const payloadText = trimmed.slice(5).trim()
            if (!payloadText) continue
            if (payloadText === '[DONE]') {
              completed = true
              break
            }
            try {
              const payload = JSON.parse(payloadText) as {
                choices?: Array<{ delta?: { content?: unknown } }>
                error?: { message?: string }
              }
              if (payload.error) {
                yield { type: 'error' as const, error: { code: 'INTERNAL', message: payload.error.message ?? 'Provider returned an error', retryable: false } }
                return
              }
              const content = payload.choices?.[0]?.delta?.content
              if (typeof content === 'string' && content.length > 0) yield { type: 'delta' as const, text: content }
            } catch {
              yield { type: 'error' as const, error: { code: 'INTERNAL', message: 'Malformed provider stream payload', retryable: false } }
              return
            }
          }
        }

        if (signal?.aborted) return
        yield { type: 'done' as const }
      } catch (error) {
        if (signal?.aborted) return
        const message = error instanceof Error ? error.message : 'Unknown provider error'
        yield { type: 'error' as const, error: { code: 'NETWORK', message, retryable: true } }
      }
    },
  }
}
