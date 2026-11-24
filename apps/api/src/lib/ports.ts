import type { ProviderAdapter } from '@nibhrito/contracts'
import { createFakeProvider, createOllamaProvider } from '@nibhrito/ai-providers'

// Simple dependency injection container
export interface AppPorts {
  provider: ProviderAdapter
}

function createPorts(): AppPorts {
  const ollamaUrl = process.env.OLLAMA_URL
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama2'

  if (ollamaUrl) {
    return {
      provider: createOllamaProvider({ baseUrl: ollamaUrl, model: ollamaModel }),
    }
  }

  // Fallback to fake provider for development
  return {
    provider: createFakeProvider({
      fixedResponse: 'This is a development response. Configure OLLAMA_URL to use a real model.',
    }),
  }
}

export const ports = createPorts()