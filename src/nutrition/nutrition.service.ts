import { normalizeImage } from '../images/normalize.js'
import { estimateCost, type CostEstimate, type LlmEffort, type LlmPort, type LlmUsage } from '../llm/index.js'
import { computePortion, type Portion } from './nutrition.calc.js'
import {
  buildNutritionPrompt,
  NUTRITION_SCHEMA,
  NUTRITION_SYSTEM_PROMPT,
  type NutritionAnalysis,
  type NutritionItem,
} from './nutrition.prompt.js'

export type AnalyzePhotoInput = {
  /** The upload as received; normalized (rotation, size, JPEG) here, not in the request parser. */
  photo: Buffer
  model: string
  effort: LlmEffort
  thinking: boolean
  hint: string | null
  grams: number | null
}

export type AnalyzedItem = NutritionItem & {
  /** Given grams win over the model's estimate; null when neither is available. */
  portion: Portion | null
}

export type AnalyzePhotoResult = {
  items: AnalyzedItem[]
  stats: {
    model: string
    effort: LlmEffort
    /** What the model actually saw, after normalization. */
    image: { width: number; height: number; bytes: number }
    usage: LlmUsage
    cost: CostEstimate | null
    durationMs: number
  }
}

export async function analyzePhoto(llm: LlmPort, input: AnalyzePhotoInput): Promise<AnalyzePhotoResult> {
  const startedAt = Date.now()

  const image = await normalizeImage(input.photo)
  const result = await llm.complete<NutritionAnalysis>({
    system: NUTRITION_SYSTEM_PROMPT,
    prompt: buildNutritionPrompt({ hint: input.hint, grams: input.grams }),
    model: input.model,
    effort: input.effort,
    thinking: input.thinking,
    schema: NUTRITION_SCHEMA,
    // a photo is never sent twice, and a cache write costs 2x plain input on the live backend
    cache: false,
    images: [{ mediaType: image.mediaType, base64: image.bytes.toString('base64') }],
  })

  const items = result.data.items.map((item) => withPortion(item, input.grams))
  const stats = {
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

function withPortion(item: NutritionItem, givenGrams: number | null): AnalyzedItem {
  const grams = givenGrams ?? item.portionGrams.estimate
  const portion = grams === null ? null : computePortion(item.per100g, grams)
  return { ...item, portion }
}
