import type { Macros } from '../nutrition/nutrition.prompt.js'

/** How the item's underside meets the surface; the row says how much of the measured volume is air under it. */
export type Shape = 'sphere' | 'cylinder' | 'flat'

export type ShapeSpec = {
  /** True volume over measured volume: the calibrated value when there is one, else theory. */
  factor: number
  /** The ideal solid's ratio, see health/docs/nutrition/portion-prompts-v5.md "Shape table". */
  theory: number
  calibrated: string | null
}

export const SHAPES: Record<Shape, ShapeSpec> = {
  // what the scale implied over ten round stills (four apples, two mandarins, 6–48°); a flatter base and the far side lost past 40° both sit in it
  sphere: { factor: 0.94, theory: 0.8, calibrated: 'ten round stills, 2026-09-27' },
  cylinder: { factor: 0.87, theory: 0.88, calibrated: 'banana 157 g, 2026-09-24' },
  flat: { factor: 1, theory: 1, calibrated: null },
}

export const SHAPE_KEYS = Object.keys(SHAPES) as Shape[]

export type State = 'whole' | 'peeled' | 'cut'

export const STATES: readonly State[] = ['whole', 'peeled', 'cut']

export type InediblePart = 'peel' | 'skin' | 'core' | 'stone'

// what peeling takes off
const PEELED_AWAY: readonly InediblePart[] = ['peel', 'skin']

export type ProductSpec = {
  /** g/ml of the item as grown, peel included. */
  density: number
  /** Of the edible part. */
  per100g: Macros
  /** Shares of the whole that are not eaten. */
  inedible: Partial<Record<InediblePart, number>>
}

// apple and banana densities are what the scale implied at the shape factor; the rest are reference values, see the doc
export const PRODUCTS = {
  apple: { density: 0.8, per100g: { kcal: 52, protein: 0.3, fat: 0.2, carbs: 13.8 }, inedible: { core: 0.1 } },
  pear: { density: 0.95, per100g: { kcal: 57, protein: 0.4, fat: 0.1, carbs: 15.2 }, inedible: { core: 0.1 } },
  banana: { density: 0.95, per100g: { kcal: 89, protein: 1.1, fat: 0.3, carbs: 22.8 }, inedible: { peel: 0.35 } },
  orange: { density: 0.95, per100g: { kcal: 47, protein: 0.9, fat: 0.1, carbs: 11.8 }, inedible: { peel: 0.28 } },
  mandarin: { density: 0.95, per100g: { kcal: 53, protein: 0.8, fat: 0.3, carbs: 13.3 }, inedible: { peel: 0.28 } },
  peach: { density: 0.97, per100g: { kcal: 39, protein: 0.9, fat: 0.3, carbs: 9.5 }, inedible: { stone: 0.08 } },
  plum: { density: 1, per100g: { kcal: 46, protein: 0.7, fat: 0.3, carbs: 11.4 }, inedible: { stone: 0.06 } },
  kiwi: { density: 1, per100g: { kcal: 61, protein: 1.1, fat: 0.5, carbs: 14.7 }, inedible: { skin: 0.12 } },
  tomato: { density: 0.98, per100g: { kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9 }, inedible: {} },
  cucumber: { density: 0.96, per100g: { kcal: 15, protein: 0.7, fat: 0.1, carbs: 3.6 }, inedible: {} },
  carrot: { density: 1.04, per100g: { kcal: 41, protein: 0.9, fat: 0.2, carbs: 9.6 }, inedible: {} },
  potato: { density: 1.08, per100g: { kcal: 77, protein: 2, fat: 0.1, carbs: 17.5 }, inedible: { skin: 0.1 } },
} satisfies Record<string, ProductSpec>

export type ProductKey = keyof typeof PRODUCTS

export const PRODUCT_KEYS = Object.keys(PRODUCTS) as ProductKey[]

/** What stays uneaten once the state is applied. */
export function inedibleParts(product: ProductSpec, state: State): Array<[InediblePart, number]> {
  const parts = Object.entries(product.inedible) as Array<[InediblePart, number]>
  return parts.filter(([part]) => state !== 'peeled' || !PEELED_AWAY.includes(part))
}
