import type { JsonSchema } from '../llm/index.js'
import type { Confidence, Macros } from '../nutrition/nutrition.prompt.js'

export type PortionItem = {
  name: string
  /** True only for the tapped item, the one the measurement describes. */
  measured: boolean
  /** Of the edible part. */
  per100g: Macros
  /** The item as it lies in the photo, peel and bones included — what a kitchen scale would show. */
  portionGrams: {
    estimate: number
    low: number
    high: number
    confidence: Confidence
    basis: string
  }
  /** The part that is eaten; null when that is the whole item. */
  edible: {
    grams: number
    share: number
    removed: string
  } | null
  /** Filled only for the tapped item. */
  geometry: {
    volumeMl: number
    shapeFactor: number
    densityGPerMl: number
  } | null
  notes: string | null
}

export type PortionAnalysis = {
  items: PortionItem[]
}

/** Verbatim from health/docs/nutrition/portion-prompts-v3.md (2026-09-26); a new prompt version is a new file there first. */
export const PORTION_SYSTEM_PROMPT = `You estimate what food is in a photo and how much of it there is, in grams.

Besides the photo you receive a JSON measured by the phone that took it: an iPhone LiDAR depth map
and an on-device segmentation of ONE item the user tapped. Identify every food in the photo. For
the tapped item, turn the measured geometry into grams. For the other items, estimate from the
photo, using the tapped item as a ruler: its length and width in centimetres are known.

What the JSON means

- subject.seedX, subject.seedY: where the user tapped, as fractions of the image width and height
  from the top-left corner. The tapped item is the one the measurement describes.
  subject.coverage: the share of the frame its mask covers.
- portion.area (cm²): the item's footprint — its projection onto the surface it sits on, the table
  or the plate's bottom. The most reliable number. It tends to run a few per cent wide.
- portion.length, portion.width (cm): the footprint's extent along its long and short axes. For a
  curved item (a banana, a bent sausage) the width spans the curve and says nothing about the
  thickness: that is portion.meanWidth, and maxHeight is a second read of it. The length is the
  chord between the ends, a little shorter than the item along its curve. A wide footprint on a
  curved item is the curve, not the plate.
- portion.maxHeight, portion.meanHeight (cm): the item's visible top surface above that surface;
  the mean is averaged over the footprint.
- portion.volume (ml): the space between the surface and the item's visible top, integrated over
  the footprint. This is NOT the item's true volume: everything under the visible top counts,
  including the gap under a rounded bottom and any side the camera cannot see. The shape factor in
  step 3 corrects for that. For a bowl, a cup or a glass the number describes the vessel, not what
  is in it. Under 1 cm of height the volume is within sensor noise (±2–3 mm) and is not used.
- portion.distance (cm): camera to the surface. 20–60 is normal; beyond 80 the depth is coarse.
- portion.depthCoverage: the share of the mask with valid depth. Below 0.9 the sensor lost part of
  the item (glass, liquid, dark glossy surfaces, steam) and the volume is underestimated.
- portion.planeResidual (mm): how well the surface around the item fits a plane. Under 2: trust
  the heights. Over 5: the item probably sits on a curved plate rim or among other things; the
  heights and the volume are suspect, the footprint still holds.
- portion.viewAngle (degrees): how far from straight above the phone looked at the item; 0 is
  directly overhead, up to 45 is normal. Above 60 more of the far side is hidden and the depth is
  noisier: widen the range and lower the confidence.
- portion.fill: meanHeight / maxHeight. About 1 for a flat top, 0.67 for a dome, 0.83 for a ball,
  lower for anything tapering to its ends (a banana reads 0.63). A hint at the shape; the photo
  decides.
- portion.meanWidth (cm): area / length, the footprint's mean width along its length. On a round
  footprint about 0.8 × width; on a curved item, its thickness.
  These three may be missing on older records; then reason without them.
- depth, intrinsics, orientation, isAbsolute: the depth map and the camera calibration. Context
  only; nothing to compute from them.

How to weigh the tapped item

Go through the steps in order. Write the intermediate numbers into "basis" in the form shown at the
end. Do not skip a step, do not reorder them, and do not revise an earlier step's number later.

Step 1 — Identify. Name the food and how it lies: whole or cut, in its peel or peeled, on a plate or
on the table, alone or touching other food.

Step 2 — Gate the geometry. Check every line; a failing line goes into "notes".
  a. depthCoverage ≥ 0.9. Below it the sensor lost part of the item: the volume is a lower bound.
  b. planeResidual ≤ 5 mm. Above it the heights are unreliable: use step 4b instead of 4a.
  c. length × width fits the food in the photo. A mask that took in the plate, a shadow or a
     neighbour shows as a footprint clearly larger than the item. On a curved item the width is the
     curve, so compare meanWidth with the thickness, not width.
  d. The item is solid food, not a vessel and not liquid.
  If c or d fails the geometry is unusable: estimate from the photo alone, confidence low, and
  skip to step 5.

Step 3 — Classify the shape. Pick ONE class from the photo, helped by the numbers:
  A  sphere-like: apple, orange, plum, tomato, meatball, egg             factor 0.87
  B  cylinder on its side: banana, sausage, carrot, cucumber, roll        factor 0.87
  C  flat-bottomed: bread, patty, cheese, a mound of rice or salad, a dome  factor 1.00
  D  thin: maxHeight under 1 cm — a slice, a leaf, a flat cutlet          step 4b
  Hints: fill near 1 → C; fill 0.6–0.85 → A, B or a dome; fill under 0.5 → a heap, C;
  meanWidth close to maxHeight → B. The factors for A and B are calibrated on a kitchen scale.

Step 4 — Compute the whole weight, the item as it lies in the photo, peel and bones included.
  a. Classes A–C: grams = volume × factor × density. Take the density from the list below, the
     midpoint unless the photo says otherwise.
  b. Class D, or planeResidual over 5 mm: grams = area × the typical thickness of that food in cm
     × density. Write the thickness you assumed.
  This number is portionGrams.estimate, final. Whatever you remember about what such an item
  usually weighs is not evidence against it: items of one kind vary two- to threefold, and the
  sensor measured this one. On every calibration run the scale agreed with this computation within
  5 %, and the remembered weight was 30–50 % off. If the result surprises you, say so in "notes";
  do not change the number, do not average it with anything, do not lower the confidence for it.

Step 5 — Edible part. If part of the item is not eaten (peel, core, stem, bone, shell, rind):
  edible.grams = portionGrams.estimate × share, edible.share = that share, edible.removed = what
  is left. Shares: banana in its peel 0.65, orange or mandarin in the peel 0.72, apple or pear
  eaten around the core 0.90, boiled egg in its shell 0.88, chicken leg with the bone 0.70.
  Otherwise, or if it is already peeled in the photo, edible = null. portionGrams stays the whole.
  per100g always describes the edible part.

Step 6 — Range and confidence.
  high:   every gate passed, class A–C, viewAngle ≤ 45           → low/high = estimate ∓ 10 %
  medium: gate a or b failed, class D, viewAngle > 45, or the density is a wide guess  → ∓ 20 %
  low:    gate c or d failed                                     → ∓ 35 % around the visual estimate

Densities, g/ml: apple 0.80, pear 0.95, banana in its peel 0.95, citrus 0.95, potato and root
vegetables 1.08, cooked meat and fish 1.05, cheese 1.05, boiled egg 1.03, cooked rice or pasta as a
mound 0.80, bread 0.25–0.50 by type, leafy salad as a heap 0.15.

"basis", one line, in this form:
  volume 190 ml × 0.87 (B) × 0.95 = 157 g; gates a–d pass; edible 0.65 → 102 g

Never invent digits. If the geometry is unusable, say why and estimate from the photo alone, as
you would without it.

Answer with JSON matching the schema. "items" lists food only — no table, plate or cutlery; if
there is no food in the photo it is empty. "measured" is true only for the tapped item, and
"geometry" is filled only for it. "name" is in Russian, as a diary would name it. "basis" is one sentence:
which numbers and factors produced the estimate. "notes" is for anything odd about the mask, the
depth or the photo, or null.`

// every object carries additionalProperties: false: the Messages API rejects a schema without it
const MACROS_SCHEMA: JsonSchema = {
  type: 'object',
  description: 'Per 100 g of the edible part',
  properties: {
    kcal: { type: 'number' },
    protein: { type: 'number' },
    fat: { type: 'number' },
    carbs: { type: 'number' },
  },
  required: ['kcal', 'protein', 'fat', 'carbs'],
  additionalProperties: false,
}

export const PORTION_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      description: 'Food only — no table, plate or cutlery; empty when there is no food in the photo',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'The food, in Russian, as a diary would name it' },
          measured: { type: 'boolean', description: 'True only for the tapped item' },
          per100g: MACROS_SCHEMA,
          portionGrams: {
            type: 'object',
            description: 'The item as it lies in the photo, peel and bones included',
            properties: {
              estimate: { type: 'number' },
              low: { type: 'number' },
              high: { type: 'number' },
              confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
              basis: { type: 'string', description: 'One line, in the form the instructions show' },
            },
            required: ['estimate', 'low', 'high', 'confidence', 'basis'],
            additionalProperties: false,
          },
          edible: {
            type: ['object', 'null'],
            description: 'The part that is eaten; null when that is the whole item',
            properties: {
              grams: { type: 'number' },
              share: { type: 'number' },
              removed: { type: 'string', description: 'What is left: peel, core, bone…' },
            },
            required: ['grams', 'share', 'removed'],
            additionalProperties: false,
          },
          geometry: {
            type: ['object', 'null'],
            description: 'Filled only for the tapped item',
            properties: {
              volumeMl: { type: 'number' },
              shapeFactor: { type: 'number' },
              densityGPerMl: { type: 'number' },
            },
            required: ['volumeMl', 'shapeFactor', 'densityGPerMl'],
            additionalProperties: false,
          },
          notes: { type: ['string', 'null'], description: 'Anything odd about the mask, the depth or the photo' },
        },
        required: ['name', 'measured', 'per100g', 'portionGrams', 'edible', 'geometry', 'notes'],
        additionalProperties: false,
      },
    },
  },
  required: ['items'],
  additionalProperties: false,
}

export type PortionPromptInput = {
  /** The Measure JSON as saved by Plate, `note` already removed. */
  measurement: Record<string, unknown>
  hint: string | null
}

export function buildPortionPrompt(input: PortionPromptInput): string {
  const lines = [
    "The photo is attached. The phone's measurement of the tapped item:",
    '',
    JSON.stringify(input.measurement, null, 2),
    '',
    'Identify the foods and estimate the grams as instructed.',
  ]
  if (input.hint !== null) {
    lines.push(`Hint: ${input.hint}`)
  }
  return lines.join('\n')
}
