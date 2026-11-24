import { createOpenAICompatibleProvider } from './openai-compatible'

export interface HuggingFaceProviderConfig {
  apiKey: string
  model: string
  baseUrl?: string
}

export function createHuggingFaceProvider(config: HuggingFaceProviderConfig) {
  return createOpenAICompatibleProvider({
    id: 'huggingface',
    name: `Hugging Face (${config.model})`,
    apiKey: config.apiKey,
    model: config.model,
    baseUrl: config.baseUrl ?? 'https://router.huggingface.co/v1',
  })
}
