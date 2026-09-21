import type { LlmUsage } from './port.js'

export type ModelPricing = {
  input: number
  cacheRead: number
  output: number
}

/**
 * USD per million tokens, verified against platform.claude.com/docs/en/about-claude/pricing on 2026-09-20.
 * Cost is computed here from the port's usage — never taken from a backend.
 */
export const MODEL_PRICING_USD_PER_MTOK: Record<string, ModelPricing> = {
  'claude-fable-5-1': { input: 10, cacheRead: 0.25, output: 50 },
  'claude-opus-5': { input: 5, cacheRead: 0.5, output: 25 },
  'claude-sonnet-5': { input: 2, cacheRead: 0.2, output: 10 },
  'claude-haiku-4-5-20251001': { input: 1, cacheRead: 0.1, output: 5 },
}

// the live backend writes 1-hour cache entries (2x input); 5-minute writes would be 1.25x — the port does not distinguish them
const CACHE_WRITE_MULTIPLIER = 2

const USD_PER_TOKEN_FACTOR = 1 / 1_000_000

export type CostEstimate = {
  totalUsd: number
  breakdownUsd: LlmUsage
}

export function estimateCost(model: string, usage: LlmUsage): CostEstimate | null {
  const pricing = MODEL_PRICING_USD_PER_MTOK[model]
  if (!pricing) {
    return null
  }

  const breakdownUsd: LlmUsage = {
    input: usage.input * pricing.input * USD_PER_TOKEN_FACTOR,
    cacheWrite: usage.cacheWrite * pricing.input * CACHE_WRITE_MULTIPLIER * USD_PER_TOKEN_FACTOR,
    cacheRead: usage.cacheRead * pricing.cacheRead * USD_PER_TOKEN_FACTOR,
    output: usage.output * pricing.output * USD_PER_TOKEN_FACTOR,
  }
  const totalUsd = breakdownUsd.input + breakdownUsd.cacheWrite + breakdownUsd.cacheRead + breakdownUsd.output

  return { totalUsd, breakdownUsd }
}
