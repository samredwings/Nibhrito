import { z } from 'zod'

export const ProviderConfigSchema = z.object({
  name: z.string().min(1).max(100),
  adapter: z.enum(['OLLAMA', 'GGUF', 'HUGGINGFACE', 'OPENROUTER']),
  endpoint: z.string().url().optional(),
  isDefault: z.boolean().default(false),
  isEnabled: z.boolean().default(true),
})

export type ProviderConfigSchema = z.infer<typeof ProviderConfigSchema>