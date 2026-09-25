import { query, type Options, type SDKResultMessage, type SDKUserMessage } from '@anthropic-ai/claude-agent-sdk'

import {
  LlmError,
  type LlmErrorCode,
  type LlmPort,
  type LlmRequest,
  type LlmResult,
  type LlmUsage,
} from '../port.js'

/** The one live adapter. Everything vendor-specific stays inside this file — see ../README.md. */
export class AgentSdkAdapter implements LlmPort {
  async complete<T = unknown>(request: LlmRequest): Promise<LlmResult<T>> {
    const options = buildOptions(request)
    const prompt = request.images?.length ? userMessageWithImages(request) : request.prompt

    let result: SDKResultMessage | undefined
    try {
      for await (const message of query({ prompt, options })) {
        if (message.type === 'result') {
          result = message
          break
        }
      }
    } catch (err) {
      throw new LlmError(thrownErrorCode(err), `agent sdk query failed: ${messageOf(err)}`, { cause: err })
    }

    if (!result) {
      throw new LlmError('backend_failed', 'agent sdk ended without a result message')
    }
    if (result.subtype !== 'success') {
      throw new LlmError(resultErrorCode(result.subtype), result.errors.join('; ') || result.subtype)
    }
    if (result.is_error) {
      throw new LlmError('backend_failed', result.result)
    }
    if (request.schema && result.structured_output === undefined) {
      throw new LlmError('invalid_output', 'backend returned no structured output')
    }

    return {
      text: result.result,
      data: (result.structured_output ?? null) as T,
      usage: normalizeUsage(result.usage),
    }
  }
}

function buildOptions(request: LlmRequest): Options {
  return {
    model: request.model,
    systemPrompt: request.system,
    tools: [], // no built-in tools
    settingSources: [], // no CLAUDE.md / settings.json leakage into the request
    persistSession: false,
    ...(request.effort ? { effort: request.effort } : {}),
    ...(request.thinking === false ? { thinking: { type: 'disabled' as const } } : {}),
    ...(request.schema ? { outputFormat: { type: 'json_schema' as const, schema: request.schema } } : {}),
    // the SDK has no per-request cache switch; the env flag is the closest thing
    ...(request.cache === false ? { env: { ...process.env, DISABLE_PROMPT_CACHING: '1' } } : {}),
  }
}

// content blocks (images) only travel in the streaming prompt form
async function* userMessageWithImages(request: LlmRequest): AsyncIterable<SDKUserMessage> {
  yield {
    type: 'user',
    parent_tool_use_id: null,
    message: {
      role: 'user',
      content: [
        ...(request.images ?? []).map((image) => ({
          type: 'image' as const,
          source: { type: 'base64' as const, media_type: image.mediaType, data: image.base64 },
        })),
        { type: 'text' as const, text: request.prompt },
      ],
    },
  }
}

function normalizeUsage(usage: SDKResultMessage['usage']): LlmUsage {
  return {
    input: usage.input_tokens ?? 0,
    cacheWrite: usage.cache_creation_input_tokens ?? 0,
    cacheRead: usage.cache_read_input_tokens ?? 0,
    output: usage.output_tokens ?? 0,
  }
}

function resultErrorCode(subtype: Exclude<SDKResultMessage['subtype'], 'success'>): LlmErrorCode {
  switch (subtype) {
    case 'error_max_turns':
    case 'error_max_budget_usd':
      return 'limit_reached'
    case 'error_max_structured_output_retries':
      return 'invalid_output'
    default:
      return 'backend_failed'
  }
}

function thrownErrorCode(err: unknown): LlmErrorCode {
  const aborted = err instanceof Error && err.name === 'AbortError'
  return aborted ? 'aborted' : 'backend_failed'
}

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
