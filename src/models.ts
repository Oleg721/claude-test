import { MODEL_PRICING_USD_PER_MTOK } from './llm/index.js'

// picked on the 2026-09-20 photo benchmark: no schema retries, best label reading, fastest
export const DEFAULT_MODEL = 'claude-opus-5'

/** Pinned ids from platform.claude.com/docs/en/about-claude/models/overview (2026-09-20). */
export const KNOWN_MODELS: readonly string[] = Object.keys(MODEL_PRICING_USD_PER_MTOK)

// HTTP-side convenience only: the port takes full ids — see llm/README.md "Forbidden"
const MODEL_ALIASES: Record<string, string> = {
  fable: 'claude-fable-5-1',
  opus: 'claude-opus-5',
  sonnet: 'claude-sonnet-5',
  haiku: 'claude-haiku-4-5-20251001',
  'claude-haiku-4-5': 'claude-haiku-4-5-20251001',
}

/** Alias or full id → full id; null when unknown. Undefined → the default model. */
export function resolveModel(raw: string | undefined): string | null {
  if (raw === undefined) {
    return DEFAULT_MODEL
  }
  const id = MODEL_ALIASES[raw] ?? raw
  return KNOWN_MODELS.includes(id) ? id : null
}
