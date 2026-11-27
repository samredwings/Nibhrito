import type { ProviderAdapter } from '@nibhrito/contracts'
import {
  createFakeProvider,
  createHuggingFaceProvider,
  createOllamaProvider,
  createOpenRouterProvider,
} from '@nibhrito/ai-providers'

// Provider choice is explicit and fixed for the lifetime of this API process.
// Set AI_PROVIDER to ollama, huggingface, openrouter, or fake.
export interface AppPorts {
  provider: ProviderAdapter
}

function unavailableProvider(reason: string): ProviderAdapter {
  return {
    id: 'unconfigured',
    name: 'AI provider not configured',
    capabilities: () => ['TEXT'],
    health: async () => ({ status: 'unavailable', reason }),
    generate: async function* () {
      yield {
        type: 'error' as const,
        error: { code: 'INTERNAL' as const, message: reason, retryable: false },
      }
    },
  }
}

function createProvider(): ProviderAdapter {
  const selected = (process.env.AI_PROVIDER || (
    process.env.OLLAMA_URL
      ? 'ollama'
      : process.env.NODE_ENV === 'production'
        ? 'unconfigured'
        : 'fake'
  )).trim().toLowerCase()

  if (selected === 'fake') {
    return createFakeProvider({
      fixedResponse: 'This is a development response. Configure AI_PROVIDER for a real model.',
    })
  }

  if (selected === 'ollama') {
    const baseUrl = process.env.OLLAMA_URL
    if (!baseUrl) return unavailableProvider('AI_PROVIDER=ollama requires OLLAMA_URL.')
    return createOllamaProvider({
      baseUrl,
      model: process.env.OLLAMA_MODEL || 'llama3.1',
    })
  }

  if (selected === 'huggingface' || selected === 'hf') {
    const apiKey = process.env.HUGGINGFACE_API_KEY
    const model = process.env.HUGGINGFACE_MODEL
    if (!apiKey || !model) {
      return unavailableProvider('AI_PROVIDER=huggingface requires HUGGINGFACE_API_KEY and HUGGINGFACE_MODEL.')
    }
    return createHuggingFaceProvider({
      apiKey,
      model,
      baseUrl: process.env.HUGGINGFACE_BASE_URL,
    })
  }

  if (selected === 'openrouter') {
    const apiKey = process.env.OPENROUTER_API_KEY
    const model = process.env.OPENROUTER_MODEL
    if (!apiKey || !model) {
      return unavailableProvider('AI_PROVIDER=openrouter requires OPENROUTER_API_KEY and OPENROUTER_MODEL.')
    }
    return createOpenRouterProvider({
      apiKey,
      model,
      siteUrl: process.env.OPENROUTER_SITE_URL,
      appName: process.env.OPENROUTER_APP_NAME || 'Nibhrito',
    })
  }

  return unavailableProvider('Unknown AI_PROVIDER. Choose ollama, huggingface, openrouter, or fake.')
}

export const ports: AppPorts = {
  provider: createProvider(),
}
