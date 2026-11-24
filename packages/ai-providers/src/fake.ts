import type { ProviderAdapter, Capability, HealthStatus, GenerationInput } from '@nibhrito/contracts'
import { ProviderError } from './errors'

export interface FakeProviderOptions {
  delayMs?: number
  shouldError?: ProviderError['code']
  fixedResponse?: string
}

export function createFakeProvider(options: FakeProviderOptions = {}): ProviderAdapter {
  const { delayMs = 10, shouldError, fixedResponse } = options

  return {
    id: 'fake',
    name: 'Fake Provider (Test)',
    capabilities: (): readonly Capability[] => ['TEXT'],

    health: async (): Promise<HealthStatus> => {
      if (shouldError === 'ASLEEP') {
        return { status: 'unavailable', reason: 'Fake provider is asleep' }
      }
      return { status: 'healthy', latencyMs: delayMs }
    },

    generate: async function* (input: GenerationInput, signal?: AbortSignal) {
      if (shouldError) {
        const err = new ProviderError(shouldError, `Simulated ${shouldError} error`, shouldError !== 'BAD_INPUT')
        yield { type: 'error' as const, error: { code: err.code, message: err.message, retryable: err.retryable } }
        return
      }

      const response = fixedResponse || `Fake response to: ${input.messages[input.messages.length - 1]?.content.slice(0, 50)}...`
      const words = response.split(' ')

      for (let i = 0; i < words.length; i++) {
        if (signal?.aborted) {
          return
        }

        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs))
        }

        // The signal may abort while the delay is pending.
        if (signal?.aborted) return

        yield {
          type: 'delta' as const,
          text: words[i] + (i < words.length - 1 ? ' ' : ''),
        }
      }

      yield { type: 'done' as const }
    },
  }
}