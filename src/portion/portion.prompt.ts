import type { JsonSchema } from '../llm/index.js'
import type { Macros } from '../nutrition/nutrition.prompt.js'
import type { PortionMeasurement } from './portion.measurement.js'
import { PRODUCT_KEYS, SHAPE_KEYS, STATES, type ProductKey, type Shape, type State } from './portion.tables.js'

/** What the model returns: table rows and one check, never a weight; `visualGrams` is the photo-only guess kept for the record. */
export type PortionPicks = {
  product: ProductKey | 'other'
  name: string
  state: State
  shape: Shape
  /** Of the edible part; used only for a product outside the table. */
  per100g: Macros
  visualGrams: number
  notes: string | null
}

/** Verbatim from health/docs/nutrition/portion-prompts-v5.md (2026-09-27); a new prompt version is a new file there first. */
export const PORTION_SYSTEM_PROMPT = `You identify one item of fresh fruit or vegetable in a photo. The phone that took the photo also
measured the item with its LiDAR: the user tapped it, the phone segmented it, the user saw the
outline on the screen and kept it, and the phone computed the item's footprint and height on the
surface it lies on. The server turns that measurement into grams with a table of shapes and a table
of products. Your part is to pick the table rows. You never compute the weight: no number you write
is a weight, except the visual guess asked for at the end.

What you receive

The photo, and one line with the phone's numbers: where the tap landed (as percentages of the image
width and height, from the top-left corner), the footprint's length and width in centimetres and its
mean width along the length, the item's height above the surface (the maximum and the mean) and
fill, the mean height divided by the maximum. The tapped item is the one the numbers describe; if
other food is in the frame, ignore it. The numbers are the item's own and the server is calibrated
for their errors: taken at an angle, the footprint runs longer than the item.

What to pick

1. product — the row of the product table, from the list in the schema. The tapped item as grown:
   an apple is "apple" whether whole, peeled or cut. If the item is on no row, "other".
2. name — the item in Russian, as a food diary would write it, with what the photo shows: the
   variety or colour if obvious, "половинка" for a half.
3. state — "whole": as grown, in its peel or skin, uncut. "peeled": the peel or skin is off.
   "cut": a half, a wedge, a slice or a piece, peeled or not.
4. shape — how the item's underside meets the surface. The sensor sees the top only, so the class
   says how much of the space under the top is air:
   - "sphere": round every way, resting on one point or a small base — an apple, an orange, a
     tomato, a plum, a peach, a kiwi, a potato lying on its side.
   - "cylinder": long and round, lying on its side — a banana, a cucumber, a carrot. Its mean width
     is close to its height.
   - "flat": resting on a flat face — a half or a wedge with the cut side down, a slice, a piece.
   The photo decides; the numbers help: fill near 0.85 fits a sphere, fill near 0.6 fits a cylinder
   or a dome on a flat base, a mean width close to the height fits a cylinder.
5. per100g — energy and macronutrients per 100 g of the edible part, from what you know about the
   product. The server uses the table's values for a listed product and yours for "other".
6. visualGrams — the weight you would say from the photo alone, without the measurement, as a
   diary app without a sensor would. It is recorded next to the measured result and used only when
   the measurement fails.
7. notes — anything odd about the photo or the item, or null.

Answer with JSON matching the schema.`

// every object carries additionalProperties: false: the Messages API rejects a schema without it
const MACROS_SCHEMA: JsonSchema = {
  type: 'object',
  description: 'Per 100 g of the edible part, from knowledge',
  properties: {
    kcal: { type: 'number' },
    protein: { type: 'number' },
    fat: { type: 'number' },
    carbs: { type: 'number' },
  },
  required: ['kcal', 'protein', 'fat', 'carbs'],
  additionalProperties: false,
}

export const PORTION_PICKS_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    product: { type: 'string', enum: [...PRODUCT_KEYS, 'other'], description: 'The product table row; "other" when the item is on none' },
    name: { type: 'string', description: 'The item, in Russian, as a diary would name it' },
    state: { type: 'string', enum: [...STATES] },
    shape: { type: 'string', enum: [...SHAPE_KEYS], description: 'How the underside meets the surface' },
    per100g: MACROS_SCHEMA,
    visualGrams: { type: 'number', description: 'The weight from the photo alone, without the measurement' },
    notes: { type: ['string', 'null'], description: 'Anything odd about the photo or the item' },
  },
  required: ['product', 'name', 'state', 'shape', 'per100g', 'visualGrams', 'notes'],
  additionalProperties: false,
}

export type PortionPromptInput = {
  measurement: PortionMeasurement
  hint: string | null
}

/** The one line the model gets instead of the JSON: enough to name the shape, and no volume. */
export function buildPortionPrompt(input: PortionPromptInput): string {
  const { measurement, hint } = input
  const tap = measurement.seedX !== null && measurement.seedY !== null
    ? ` (tap at ${percent(measurement.seedX)} across, ${percent(measurement.seedY)} down)`
    : ''
  const lines = [
    `The photo is attached. The phone's numbers for the tapped item${tap}:`,
    `footprint ${cm(measurement.length)} × ${cm(measurement.width)} cm, mean width ${cm(measurement.meanWidth)} cm; ` +
      `height ${cm(measurement.maxHeight)} cm, mean ${cm(measurement.meanHeight)} cm, fill ${measurement.fill.toFixed(2)}.`,
    'Pick the product, its state and the shape class as instructed.',
  ]
  if (hint !== null) {
    lines.push(`Hint: ${hint}`)
  }
  return lines.join('\n')
}

function cm(value: number): string {
  return value.toFixed(1)
}

function percent(fraction: number): string {
  return `${Math.round(fraction * 100)} %`
}
