// The contract every backend must satisfy — see README.md in this folder.

export type LlmEffort = 'low' | 'medium' | 'high' | 'max'

export type LlmImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

export type LlmImage = {
  mediaType: LlmImageMediaType
  base64: string
}

export type JsonSchema = Record<string, unknown>

export type LlmRequest = {
  /** Plain string — no presets, no append. */
  system: string
  prompt: string
  /** Full model id, never an alias. */
  model: string
  /** When set, `LlmResult.data` is the parsed object matching this schema. */
  schema?: JsonSchema
  effort?: LlmEffort
  /** Prompt-caching hint; a backend that cannot control caching ignores it. Default true. */
  cache?: boolean
  images?: LlmImage[]
}

export type LlmUsage = {
  input: number
  cacheWrite: number
  cacheRead: number
  output: number
}

export type LlmResult<T = unknown> = {
  text: string
  /** Parsed structured output when `schema` was given, otherwise null. */
  data: T
  usage: LlmUsage
}

export interface LlmPort {
  complete<T = unknown>(request: LlmRequest): Promise<LlmResult<T>>
}

export type LlmErrorCode = 'backend_failed' | 'limit_reached' | 'invalid_output' | 'aborted'

export class LlmError extends Error {
  override readonly name = 'LlmError'

  constructor(
    readonly code: LlmErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options)
  }
}
