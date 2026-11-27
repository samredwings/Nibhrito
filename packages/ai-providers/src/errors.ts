export type ProviderErrorCode =
  | 'QUOTA'
  | 'ASLEEP'
  | 'REFUSED'
  | 'TIMEOUT'
  | 'NETWORK'
  | 'BAD_INPUT'
  | 'INTERNAL'

export class ProviderError extends Error {
  constructor(
    public code: ProviderErrorCode,
    message: string,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'ProviderError'
  }
}

const SECRET_PATTERNS = [
  /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi,
  /\b(?:sk|rk|pk|hf|gsk|or-v1|xox[baprs]|gh[pousr])[-_][A-Za-z0-9][A-Za-z0-9._-]{5,}\b/gi,
  /\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|token|secret)\s*[:=]\s*["']?[A-Za-z0-9._~+/-]{6,}/gi,
  /\b[A-Za-z0-9_-]{40,}\b/g,
]

/**
 * Produces a short, scrubbed summary for server logs only.
 * Never use this helper to build a client-facing error message.
 */
export function redact(value: string): string {
  let safe = value
  for (const pattern of SECRET_PATTERNS) {
    safe = safe.replace(pattern, '[REDACTED]')
  }
  return safe.slice(0, 80)
}

export function mapHttpStatusToError(
  status: number,
  body?: string
): ProviderError {
  // Provider bodies are untrusted and may contain credentials. Discard them.
  void body
  if (status === 429) {
    return new ProviderError('QUOTA', 'Rate limit exceeded', true)
  }
  if (status === 503 || status === 502) {
    return new ProviderError('ASLEEP', 'Service unavailable', true)
  }
  if (status === 408) {
    return new ProviderError('TIMEOUT', 'Request timeout', true)
  }
  if (status === 400) {
    return new ProviderError('BAD_INPUT', 'The provider rejected the request', false)
  }
  if (status === 401 || status === 403) {
    return new ProviderError('REFUSED', 'The provider rejected the credentials', false)
  }
  if (status >= 500) {
    return new ProviderError('INTERNAL', `Provider server error ${status}`, false)
  }
  return new ProviderError('NETWORK', `Provider HTTP ${status}`, true)
}
