import assert from 'node:assert/strict'
import { test } from 'node:test'

import { weighPortion } from './portion.calc.js'
import { parseMeasurement, type PortionMeasurement } from './portion.measurement.js'
import { buildPortionPrompt, type PortionPicks } from './portion.prompt.js'

// the two calibration stills, see health/docs/nutrition/portion-prompts-v4.md "What a good answer looks like"
const APPLE = measure({
  subject: { coverage: 0.085, seedX: 0.5099, seedY: 0.504 },
  portion: {
    area: 59.590848907306125,
    length: 10.169955945118957,
    width: 8.837045291395938,
    maxHeight: 8.508912163054077,
    meanHeight: 7.599536707737337,
    volume: 452.8628437163023,
    depthCoverage: 0.9846304428337125,
    planeResidual: 1.0743490561921054,
    distance: 31.03,
  },
  note: '314 g',
})
const BANANA = measure({
  portion: {
    area: 80.93918068178883,
    length: 20.558846505045008,
    width: 8.973843836548843,
    maxHeight: 3.740924861425343,
    meanHeight: 2.350172589923932,
    volume: 190.22104388924075,
    depthCoverage: 1,
    planeResidual: 1.701027452986484,
    distance: 26.47,
  },
})

const applePicks: PortionPicks = {
  product: 'apple',
  name: 'яблоко',
  state: 'whole',
  shape: 'sphere',
  maskFitsItem: true,
  per100g: { kcal: 50, protein: 0.3, fat: 0.2, carbs: 12 },
  visualGrams: 180,
  notes: null,
}

test('the apple: 453 ml × 0.94 (sphere) × 0.80 = 341 g, core off → 307 g, high', () => {
  const item = weighPortion(APPLE, applePicks)

  assert.deepEqual(item.portionGrams, {
    estimate: 341,
    low: 307,
    high: 375,
    confidence: 'high',
    basis: 'volume 453 ml × 0.94 (sphere) × 0.8 (apple) = 341 g; gates pass; edible 0.9 (core) → 307 g',
  })
  assert.deepEqual(item.edible, { grams: 307, share: 0.9, removed: 'core' })
  assert.deepEqual(item.geometry, { volumeMl: 452.9, shapeFactor: 0.94, densityGPerMl: 0.8 })
  assert.equal(item.source, 'table')
  assert.equal(item.per100g.carbs, 13.8)
})

test('the banana: 190 ml × 0.87 (cylinder) × 0.95 = 157 g, peel off → 102 g', () => {
  const item = weighPortion(BANANA, { ...applePicks, product: 'banana', name: 'банан', shape: 'cylinder' })

  assert.equal(item.portionGrams.estimate, 157)
  assert.equal(item.portionGrams.confidence, 'high')
  assert.deepEqual(item.edible, { grams: 102, share: 0.65, removed: 'peel' })
})

test('a peeled banana keeps the whole weight and is eaten whole', () => {
  const item = weighPortion(BANANA, { ...applePicks, product: 'banana', shape: 'cylinder', state: 'peeled' })

  assert.equal(item.portionGrams.estimate, 157)
  assert.equal(item.edible, null)
})

test('a mask that does not fit falls back to the visual estimate at low confidence', () => {
  const item = weighPortion(APPLE, { ...applePicks, maskFitsItem: false })

  assert.deepEqual(item.portionGrams, {
    estimate: 180,
    low: 117,
    high: 243,
    confidence: 'low',
    basis: 'the mask does not fit the item (model); visual estimate 180 g',
  })
  assert.equal(item.geometry, null)
  assert.equal(item.gates.mask, false)
})

test('a product outside the table gets no grams and keeps the model\'s per-100 g values', () => {
  const item = weighPortion(APPLE, { ...applePicks, product: 'other', name: 'манго' })

  assert.equal(item.portionGrams.estimate, null)
  assert.equal(item.portionGrams.confidence, 'low')
  assert.equal(item.source, 'knowledge')
  assert.equal(item.per100g.carbs, 12)
  assert.equal(item.edible, null)
})

test('the prompt line carries the footprint, the heights and fill, never the volume', () => {
  const prompt = buildPortionPrompt({ measurement: APPLE, hint: null })

  assert.match(prompt, /\(tap at 51 % across, 50 % down\)/)
  assert.match(prompt, /footprint 10\.2 × 8\.8 cm, mean width 5\.9 cm; height 8\.5 cm, mean 7\.6 cm, fill 0\.89\./)
  assert.doesNotMatch(prompt, /45[23]/)
})

test('a record without the geometry block is refused', () => {
  assert.deepEqual(parseMeasurement({ note: '314 g' }), {
    error: 'measurement.portion (the geometry block of the Measure JSON) is required',
  })
  assert.deepEqual(parseMeasurement({ portion: { area: 1 } }), {
    error: 'measurement.portion needs finite numbers in length, width, maxHeight, meanHeight, volume, depthCoverage, planeResidual',
  })
})

function measure(raw: Record<string, unknown>): PortionMeasurement {
  const parsed = parseMeasurement(raw)
  if ('error' in parsed) {
    throw new Error(parsed.error)
  }
  return parsed
}
