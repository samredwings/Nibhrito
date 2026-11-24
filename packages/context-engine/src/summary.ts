import type { ContextSlot } from './types'

export interface SummaryInput {
  previousSummary?: string | null
  messagesToSummarize: Array<{ role: string; content: string }>
  maxLength: number
}

export interface SummaryOutput {
  summary: string
  tokens: number
}

/**
 * Pure function to compact old messages into a rolling summary.
 * In production, this may call a model; here we provide a deterministic
 * fallback that concatenates with truncation.
 */
export function compactSummary(input: SummaryInput): SummaryOutput {
  const parts: string[] = []

  if (input.previousSummary) {
    parts.push(`Previous context: ${input.previousSummary}`)
  }

  const messageTexts = input.messagesToSummarize
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n')

  if (messageTexts) {
    parts.push(`Recent events: ${messageTexts}`)
  }

  let summary = parts.join('\n\n')

  // Truncate to approximate maxLength characters
  if (summary.length > input.maxLength) {
    summary = summary.slice(0, input.maxLength - 3) + '...'
  }

  // Token estimate: ~0.75 words per token
  const words = summary.trim().split(/\s+/).length
  const tokens = Math.ceil(words / 0.75)

  return { summary, tokens }
}