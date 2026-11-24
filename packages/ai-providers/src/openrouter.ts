import { createOpenAICompatibleProvider } from './openai-compatible'

export interface OpenRouterProviderConfig {
  apiKey: string
  model: string
  baseUrl?: string
  siteUrl?: string
  appName?: string
}

export function createOpenRouterProvider(config: OpenRouterProviderConfig) {
  const extraHeaders: Record<string, string> = {}
  if (config.siteUrl) extraHeaders['HTTP-Referer'] = config.siteUrl
  if (config.appName) extraHeaders['X-Title'] = config.appName

  return createOpenAICompatibleProvider({
    id: 'openrouter',
    name: `OpenRouter (${config.model})`,
    apiKey: config.apiKey,
    model: config.model,
    baseUrl: config.baseUrl ?? 'https://openrouter.ai/api/v1',
    extraHeaders,
  })
}
