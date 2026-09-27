import type { Confidence, Macros } from '../nutrition/nutrition.prompt.js'
import type { PortionMeasurement } from './portion.measurement.js'
import type { PortionPicks } from './portion.prompt.js'
import { inedibleParts, PRODUCTS, SHAPES, type ProductKey, type ProductSpec, type Shape, type State } from './portion.tables.js'

export type Gates = {
  /** depthCoverage ≥ 0.9; below it the volume is a lower bound. */
  depth: boolean
  /** planeResidual ≤ 5 mm; above it the heights are suspect. */
  plane: boolean
  /** viewAngle absent or ≤ 45°. */
  angle: boolean
  /** maxHeight ≥ 1 cm; below it the volume is within sensor noise. */
  height: boolean
  /** The model's check that the footprint is the item alone. */
  mask: boolean
  /** The product is in the table. */
  product: boolean
}

export type PortionItem = {
  name: string
  /** Always true: the branch measures the tapped item alone. */
  measured: true
  /** Where per100g came from: the product table, or the model for a product outside it. */
  source: 'table' | 'knowledge'
  per100g: Macros
  /** The item as it lies in the photo, peel included; null when no density is known. */
  portionGrams: {
    estimate: number | null
    low: number | null
    high: number | null
    confidence: Confidence
    basis: string
  }
  /** The part that is eaten; null when that is the whole item, or when nothing could be computed. */
  edible: {
    grams: number
    share: number
    removed: string
  } | null
  /** The factors the grams came from; null on the visual fallback. */
  geometry: {
    volumeMl: number
    shapeFactor: number
    densityGPerMl: number
  } | null
  picks: {
    product: ProductKey | 'other'
    state: State
    shape: Shape
    maskFitsItem: boolean
    visualGrams: number
  }
  gates: Gates
  notes: string | null
}

const MIN_DEPTH_COVERAGE = 0.9
const MAX_PLANE_RESIDUAL_MM = 5
const MAX_VIEW_ANGLE_DEG = 45
const MIN_HEIGHT_CM = 1
const SPREAD: Record<Confidence, number> = { high: 0.1, medium: 0.2, low: 0.35 }

/** Picks + measurement → the weighed item; pure, see health/docs/nutrition/portion-prompts-v4.md "What the server computes". */
export function weighPortion(measurement: PortionMeasurement, picks: PortionPicks): PortionItem {
  const product = picks.product === 'other' ? null : PRODUCTS[picks.product]
  const gates: Gates = {
    depth: measurement.depthCoverage >= MIN_DEPTH_COVERAGE,
    plane: measurement.planeResidual <= MAX_PLANE_RESIDUAL_MM,
    angle: measurement.viewAngle === null || measurement.viewAngle <= MAX_VIEW_ANGLE_DEG,
    height: measurement.maxHeight >= MIN_HEIGHT_CM,
    mask: picks.maskFitsItem,
    product: product !== null,
  }
  const common = {
    name: picks.name,
    measured: true as const,
    source: product === null ? ('knowledge' as const) : ('table' as const),
    per100g: product?.per100g ?? picks.per100g,
    picks: { product: picks.product, state: picks.state, shape: picks.shape, maskFitsItem: picks.maskFitsItem, visualGrams: picks.visualGrams },
    gates,
    notes: picks.notes,
  }

  if (product === null) {
    const basis = `"${picks.name}" is not in the product table: no density, no grams`
    return { ...common, portionGrams: { estimate: null, low: null, high: null, confidence: 'low', basis }, edible: null, geometry: null }
  }

  if (!gates.height || !gates.mask) {
    const estimate = Math.round(picks.visualGrams)
    const reason = gates.height
      ? 'the mask does not fit the item (model)'
      : `height ${round1(measurement.maxHeight)} cm is under ${MIN_HEIGHT_CM} cm: the volume is within sensor noise`
    const portionGrams = { ...range(estimate, 'low'), basis: `${reason}; visual estimate ${estimate} g` }
    return { ...common, portionGrams, edible: edibleOf(product, picks.state, estimate), geometry: null }
  }

  const shape = SHAPES[picks.shape]
  const estimate = Math.round(measurement.volume * shape.factor * product.density)
  const soft = softFailures(measurement, gates, shape.calibrated)
  const confidence: Confidence = soft.length === 0 ? 'high' : 'medium'
  const edible = edibleOf(product, picks.state, estimate)
  const basis = [
    `volume ${Math.round(measurement.volume)} ml × ${shape.factor} (${picks.shape}) × ${product.density} (${picks.product}) = ${estimate} g`,
    soft.length === 0 ? 'gates pass' : soft.join(', '),
    edible === null ? 'eaten whole' : `edible ${edible.share} (${edible.removed}) → ${edible.grams} g`,
  ].join('; ')

  return {
    ...common,
    portionGrams: { ...range(estimate, confidence), basis },
    edible,
    geometry: { volumeMl: round1(measurement.volume), shapeFactor: shape.factor, densityGPerMl: product.density },
  }
}

// the gates that lower the confidence without stopping the computation
function softFailures(measurement: PortionMeasurement, gates: Gates, calibrated: string | null): string[] {
  const reasons: string[] = []
  if (!gates.depth) {
    reasons.push(`depth on ${Math.round(measurement.depthCoverage * 100)} % of the mask, the volume is a lower bound`)
  }
  if (!gates.plane) {
    reasons.push(`plane fit ${round1(measurement.planeResidual)} mm, the heights are suspect`)
  }
  if (!gates.angle && measurement.viewAngle !== null) {
    reasons.push(`view angle ${Math.round(measurement.viewAngle)}° over ${MAX_VIEW_ANGLE_DEG}`)
  }
  if (calibrated === null) {
    reasons.push('shape factor not calibrated')
  }
  return reasons
}

function range(estimate: number, confidence: Confidence): { estimate: number; low: number; high: number; confidence: Confidence } {
  const spread = SPREAD[confidence]
  return { estimate, low: Math.round(estimate * (1 - spread)), high: Math.round(estimate * (1 + spread)), confidence }
}

function edibleOf(product: ProductSpec, state: State, grams: number): PortionItem['edible'] {
  const parts = inedibleParts(product, state)
  if (parts.length === 0) {
    return null
  }
  const share = round2(1 - parts.reduce((sum, [, part]) => sum + part, 0))
  return { grams: Math.round(grams * share), share, removed: parts.map(([part]) => part).join(', ') }
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}
