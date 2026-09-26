import Anthropic, { APIError, APIUserAbortError } from '@anthropic-ai/sdk'

import { LlmError, type LlmErrorCode, type LlmPort, type LlmRequest, type LlmResult, type LlmUsage } from '../port.js'

export type MessagesApiOptions = {
  /** Anthropic's own key; travels as `x-api-key`. */
  apiKey?: string
  /** OpenRouter's key; travels as `Authorization: Bearer`, the only header OpenRouter accepts. */
  authToken?: string
  /** Default: Anthropic's own API. OpenRouter serves the same protocol at https://openrouter.ai/api. */
  baseURL?: string
  /** OpenRouter names models "anthropic/claude-opus-5"; the port keeps the canonical id. */
  modelPrefix?: string
}

const ANTHROPIC_BASE_URL = 'https://api.anthropic.com'
// the CLI's default output cap, thinking included; above ~21k tokens the SDK insists on streaming, so the call streams
const MAX_TOKENS = 32000
// budgeted thinking (Haiku 4.5) must stay under max_tokens
const THINKING_BUDGET_TOKENS = 16000

// Haiku 4.5 rejects `effort` and knows only budgeted thinking; every newer model is adaptive and rejects a budget
function isHaiku45(model: string): boolean {
  return model.startsWith('claude-haiku-4-5')
}

// on = thinking on the way the model supports it; the API leaves Haiku 4.5 without thinking unless asked
function thinkingParam(request: LlmRequest): Anthropic.ThinkingConfigParam {
  if (request.thinking === false) {
    return { type: 'disabled' }
  }
  return isHaiku45(request.model) ? { type: 'enabled', budget_tokens: THINKING_BUDGET_TOKENS } : { type: 'adaptive' }
}

/** The Messages API with a key. Everything vendor-specific stays inside this file — see ../README.md. */
export class MessagesApiAdapter implements LlmPort {
  private readonly client: Anthropic

  constructor(private readonly options: MessagesApiOptions) {
    // every credential and the URL pinned: left undefined, the SDK reads ANTHROPIC_* from the environment instead
    this.client = new Anthropic({
      apiKey: options.apiKey ?? null,
      authToken: options.authToken ?? null,
      baseURL: options.baseURL ?? ANTHROPIC_BASE_URL,
    })
  }

  async complete<T = unknown>(request: LlmRequest): Promise<LlmResult<T>> {
    let message: Anthropic.Message
    try {
      message = await this.client.messages.stream(buildParams(request, this.options.modelPrefix ?? '')).finalMessage()
    } catch (err) {
      throw new LlmError(thrownErrorCode(err), `messages api call failed: ${messageOf(err)}`, { cause: err })
    }
    assertCompleted(message)

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')

    return { text, data: request.schema ? parseStructured<T>(text) : (null as T), usage: normalizeUsage(message.usage) }
  }
}

function buildParams(request: LlmRequest, modelPrefix: string): Anthropic.MessageStreamParams {
  const outputConfig: Anthropic.OutputConfig = {
    ...(request.effort && !isHaiku45(request.model) ? { effort: request.effort } : {}),
    ...(request.schema ? { format: { type: 'json_schema' as const, schema: request.schema } } : {}),
  }
  return {
    model: `${modelPrefix}${request.model}`,
    max_tokens: MAX_TOKENS,
    system: request.system,
    messages: [
      {
        role: 'user',
        content: [
          ...(request.images ?? []).map((image) => ({
            type: 'image' as const,
            source: { type: 'base64' as const, media_type: image.mediaType, data: image.base64 },
          })),
          { type: 'text' as const, text: request.prompt },
        ],
      },
    ],
    // no cache_control: a photo is never sent twice
    thinking: thinkingParam(request),
    ...(Object.keys(outputConfig).length > 0 ? { output_config: outputConfig } : {}),
  }
}

// only an end_turn body is an answer: output_config.format guarantees the schema, not that the text was not cut off
function assertCompleted(message: Anthropic.Message): void {
  switch (message.stop_reason) {
    case 'end_turn':
      return
    case 'max_tokens':
    case 'model_context_window_exceeded':
      throw new LlmError('limit_reached', `answer cut off: ${message.stop_reason} (max_tokens ${MAX_TOKENS})`)
    case 'refusal':
      throw new LlmError('invalid_output', 'the model refused to answer')
    default:
      throw new LlmError('backend_failed', `unexpected stop_reason ${String(message.stop_reason)}`)
  }
}

// with output_config.format the body is JSON that matches the schema; the API enforces it, we only parse
function parseStructured<T>(text: string): T {
  try {
    return JSON.parse(text) as T
  } catch (err) {
    throw new LlmError('invalid_output', 'backend returned a body that is not JSON', { cause: err })
  }
}

function normalizeUsage(usage: Anthropic.Usage): LlmUsage {
  return {
    input: usage.input_tokens,
    cacheWrite: usage.cache_creation_input_tokens ?? 0,
    cacheRead: usage.cache_read_input_tokens ?? 0,
    output: usage.output_tokens,
  }
}

function thrownErrorCode(err: unknown): LlmErrorCode {
  if (err instanceof APIUserAbortError) {
    return 'aborted'
  }
  if (err instanceof APIError && (err.status === 429 || err.status === 529)) {
    return 'limit_reached'
  }
  return 'backend_failed'
}

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
