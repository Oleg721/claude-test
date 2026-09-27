import { normalizeImage } from '../images/normalize.js'
import { estimateCost, type LlmBackend, type LlmEffort, type LlmPort } from '../llm/index.js'
import { computePortion, type Portion } from '../nutrition/nutrition.calc.js'
import type { AnalyzePhotoResult } from '../nutrition/nutrition.service.js'
import { weighPortion, type PortionItem } from './portion.calc.js'
import type { PortionMeasurement } from './portion.measurement.js'
import { buildPortionPrompt, PORTION_PICKS_SCHEMA, PORTION_SYSTEM_PROMPT, type PortionPicks } from './portion.prompt.js'

export type AnalyzePortionInput = {
  photo: Buffer
  backend: LlmBackend
  model: string
  effort: LlmEffort
  thinking: boolean
  hint: string | null
  measurement: PortionMeasurement
}

export type PortionResultItem = PortionItem & {
  /** What is eaten: per 100 g × the edible grams, or × the whole item when nothing is removed; null without grams. */
  portion: Portion | null
}

export type AnalyzePortionResult = {
  items: PortionResultItem[]
  stats: AnalyzePhotoResult['stats']
}

export async function analyzePortion(llm: LlmPort, input: AnalyzePortionInput): Promise<AnalyzePortionResult> {
  const startedAt = Date.now()

  const image = await normalizeImage(input.photo)
  const result = await llm.complete<PortionPicks>({
    system: PORTION_SYSTEM_PROMPT,
    prompt: buildPortionPrompt({ measurement: input.measurement, hint: input.hint }),
    model: input.model,
    effort: input.effort,
    thinking: input.thinking,
    schema: PORTION_PICKS_SCHEMA,
    // a photo is never sent twice, and a cache write costs 2x plain input on the Agent SDK backend
    cache: false,
    images: [{ mediaType: image.mediaType, base64: image.bytes.toString('base64') }],
  })

  const item = weighPortion(input.measurement, result.data)
  const grams = item.edible?.grams ?? item.portionGrams.estimate
  const items = [{ ...item, portion: grams === null ? null : computePortion(item.per100g, grams) }]
  const stats = {
    backend: input.backend,
    model: input.model,
    effort: input.effort,
    thinking: input.thinking,
    image: { width: image.width, height: image.height, bytes: image.bytes.length },
    usage: result.usage,
    cost: estimateCost(input.model, result.usage),
    durationMs: Date.now() - startedAt,
  }

  return { items, stats }
}
