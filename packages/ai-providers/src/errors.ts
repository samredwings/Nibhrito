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

export function mapHttpStatusToError(
  status: number,
  body?: string
): ProviderError {
  if (status === 429) {
    return new ProviderError('QUOTA', 'Rate limit exceeded', true)
  }
  if (status === 503 || status === 502) {
    return new ProviderError('ASLEEP', 'Service unavailable', true)
  }
  if (status >= 500) {
    return new ProviderError('INTERNAL', `Server error: ${status}`, false)
  }
  if (status === 400) {
    return new ProviderError('BAD_INPUT', `Bad request: ${body || status}`, false)
  }
  if (status === 408) {
    return new ProviderError('TIMEOUT', 'Request timeout', true)
  }
  return new ProviderError('NETWORK', `HTTP ${status}`, true)
}