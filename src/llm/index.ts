import { AgentSdkAdapter } from './adapters/agent-sdk.adapter.js'
import type { LlmPort } from './port.js'

export * from './port.js'
export { estimateCost, MODEL_PRICING_USD_PER_MTOK, type CostEstimate } from './pricing.js'

/** The single swap point: a new backend = a new adapter file + this one line. */
export function createLlm(): LlmPort {
  return new AgentSdkAdapter()
}
