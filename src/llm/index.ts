import { AgentSdkAdapter } from './adapters/agent-sdk.adapter.js'
import { MessagesApiAdapter } from './adapters/messages-api.adapter.js'
import type { LlmBackend, LlmPort } from './port.js'

export * from './port.js'
export { estimateCost, MODEL_PRICING_USD_PER_MTOK, type CostEstimate } from './pricing.js'

/** One adapter per configured backend: the subscription always, a keyed one when its key is in the environment. */
export type LlmPorts = {
  'agent-sdk': LlmPort
  anthropic?: LlmPort
  openrouter?: LlmPort
}

/** The single wiring point: a new backend = a new adapter file + a line here. */
export function createLlm(): LlmPorts {
  const ports: LlmPorts = { 'agent-sdk': new AgentSdkAdapter() }

  const anthropicKey = process.env['ANTHROPIC_API_KEY']
  if (anthropicKey) {
    ports.anthropic = new MessagesApiAdapter({ apiKey: anthropicKey })
  }

  const openrouterKey = process.env['OPENROUTER_API_KEY']
  if (openrouterKey) {
    ports.openrouter = new MessagesApiAdapter({
      authToken: openrouterKey,
      baseURL: 'https://openrouter.ai/api',
      modelPrefix: 'anthropic/',
    })
  }

  return ports
}

export function availableBackends(ports: LlmPorts): LlmBackend[] {
  return Object.keys(ports) as LlmBackend[]
}

/** The request parser has already checked the backend is configured; this only narrows the type. */
export function portFor(ports: LlmPorts, backend: LlmBackend): LlmPort {
  const port = ports[backend]
  if (!port) {
    throw new Error(`backend "${backend}" is not configured`)
  }
  return port
}
