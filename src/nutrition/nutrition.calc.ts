import type { Macros } from './nutrition.prompt.js'

// 1 bread unit (ХЕ) = 12 g of carbohydrates, the diary's divisor
const CARBS_PER_BREAD_UNIT = 12

export type Portion = Macros & {
  grams: number
  xe: number
}

export function computePortion(per100g: Macros, grams: number): Portion {
  const factor = grams / 100
  const carbs = round1(per100g.carbs * factor)

  return {
    grams,
    kcal: Math.round(per100g.kcal * factor),
    protein: round1(per100g.protein * factor),
    fat: round1(per100g.fat * factor),
    carbs,
    xe: round1(carbs / CARBS_PER_BREAD_UNIT),
  }
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}
