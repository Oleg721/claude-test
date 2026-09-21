import type { JsonSchema } from '../llm/index.js'

export type NutritionSource = 'label' | 'knowledge'

export type Confidence = 'low' | 'medium' | 'high'

export type Macros = {
  kcal: number
  protein: number
  fat: number
  carbs: number
}

export type NutritionItem = {
  name: string
  brand: string | null
  source: NutritionSource
  per100g: Macros
  portionGrams: {
    estimate: number | null
    confidence: Confidence
    basis: string
  }
  notes: string | null
}

export type NutritionAnalysis = {
  items: NutritionItem[]
}

export const NUTRITION_SYSTEM_PROMPT = `You are a nutrition label reader and food recognizer for a person with type 1 diabetes who logs every meal in grams and bread units. You receive one or more photos and optional text hints from the user. Several photos are different views of the same item or meal unless the hint says otherwise.

Task:
1. Identify every distinct food item or packaged product clearly visible. Ignore tableware, non-food packaging and background objects. When the user's hint names a specific product, report that product only.
2. For each item report energy and macronutrients per 100 g (per 100 ml for liquids; treat ml as g for the portion).
   - If a photo shows a nutrition facts table, read the values from it exactly and set "source" to "label". Report per 100 g even when the table lists per serving — convert with the serving size printed on the label.
   - Otherwise use your knowledge of the typical composition of that product and set "source" to "knowledge".
   - Never derive per-100 values from a front-of-pack claim ("27 g protein") when the package size or the claim's basis is not printed in the photo. Such a claim goes into "notes" as a claim, not into the numbers.
3. Portion weight in grams:
   - Packaged product: the weight or volume comes ONLY from the package (net weight / net volume, or a statement such as "per package of 250 ml") or from the user. Printed and legible → that value, confidence "high", basis "net weight on package". Not visible → estimate null, confidence "low", basis "net weight not visible". Never assume a "typical" package size.
   - Unpackaged food (fruit, a plate, a slice): estimate visually from size cues (plate, hand, cutlery); confidence "low" or "medium"; name the cue in "basis".
   - If the user's hint states the weight, do not estimate: return null with basis "given by user".
4. "name" is a short diary name in Russian ("яблоко", "хлеб бородинский", "йогурт греческий 2%"). "brand" is exactly as printed, null when absent.
5. If a label is partly unreadable or a value is uncertain, say so in "notes". Never invent digits: an unreadable label value is estimated from knowledge and the item is marked "knowledge". Front-of-pack claims whose basis you cannot read ("27 g protein**") are quoted in "notes" with the remark that the basis is not visible.
6. No commentary — produce only the structured output.`

const MACROS_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    kcal: { type: 'number', description: 'Energy, kcal per 100 g (per 100 ml for liquids)' },
    protein: { type: 'number', description: 'Protein, g per 100 g' },
    fat: { type: 'number', description: 'Fat, g per 100 g' },
    carbs: { type: 'number', description: 'Total carbohydrates, g per 100 g' },
  },
  required: ['kcal', 'protein', 'fat', 'carbs'],
}

export const NUTRITION_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      description: 'One entry per distinct food item or packaged product visible in the photo(s)',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Short diary name in Russian, e.g. "яблоко", "хлеб бородинский"' },
          brand: { type: ['string', 'null'], description: 'Brand exactly as printed on the package, null when absent' },
          source: {
            type: 'string',
            enum: ['label', 'knowledge'],
            description:
              '"label" = values read from a nutrition table in the photo; "knowledge" = estimated from general knowledge; never derived from a front-of-pack claim',
          },
          per100g: MACROS_SCHEMA,
          portionGrams: {
            type: 'object',
            properties: {
              estimate: {
                type: ['number', 'null'],
                description:
                  'Portion weight in grams (ml for liquids). Packaged product: only the printed net weight / volume, null when not visible. Unpackaged food: visual estimate. Null when the user gave the weight',
              },
              confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
              basis: {
                type: 'string',
                description:
                  '"net weight on package", "net weight not visible", "given by user", or the visual cue used for unpackaged food',
              },
            },
            required: ['estimate', 'confidence', 'basis'],
          },
          notes: {
            type: ['string', 'null'],
            description:
              'Caveats: unreadable label parts, uncertain values, sugar share of carbs, front-of-pack claims quoted with their basis (or "basis not visible")',
          },
        },
        required: ['name', 'brand', 'source', 'per100g', 'portionGrams', 'notes'],
      },
    },
  },
  required: ['items'],
}

export type NutritionPromptInput = {
  hint: string | null
  grams: number | null
}

export function buildNutritionPrompt(input: NutritionPromptInput): string {
  const lines = ['Analyze the attached photo(s).']
  if (input.hint !== null) {
    lines.push(`Hint from the user: ${input.hint}`)
  }
  if (input.grams !== null) {
    lines.push(`Portion weight given by the user: ${input.grams} g — do not estimate it.`)
  }
  return lines.join('\n')
}
