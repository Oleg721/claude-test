/** The numbers the branch reads out of Plate's Measure JSON, plus the two ratios Plate derives the same way. */
export type PortionMeasurement = {
  /** Where the user tapped, as fractions of the image; null on a record without `subject`. */
  seedX: number | null
  seedY: number | null
  /** cm², the footprint on the surface. */
  area: number
  /** cm, the footprint's extent along its principal axes. */
  length: number
  width: number
  /** cm above the surface. */
  maxHeight: number
  meanHeight: number
  /** ml, the visible top integrated over the footprint: the air under a rounded underside included. */
  volume: number
  depthCoverage: number
  /** mm */
  planeResidual: number
  /** Degrees off straight above; null on records saved before it was measured. */
  viewAngle: number | null
  /** meanHeight / maxHeight */
  fill: number
  /** cm, area / length: a curved item's thickness, which `width` is not. */
  meanWidth: number
}

export type MeasurementError = { error: string }

const REQUIRED = ['area', 'length', 'width', 'maxHeight', 'meanHeight', 'volume', 'depthCoverage', 'planeResidual'] as const
type RequiredKey = (typeof REQUIRED)[number]
// divisors of the derived ratios
const POSITIVE: readonly RequiredKey[] = ['area', 'length', 'maxHeight']

/** The Measure JSON as Plate saves it → the numbers the branch uses; everything else, `note` included, stops here. */
export function parseMeasurement(raw: Record<string, unknown>): PortionMeasurement | MeasurementError {
  const portion = raw['portion']
  if (!isRecord(portion)) {
    return { error: 'measurement.portion (the geometry block of the Measure JSON) is required' }
  }
  const missing = REQUIRED.filter((key) => !isFiniteNumber(portion[key]))
  if (missing.length > 0) {
    return { error: `measurement.portion needs finite numbers in ${missing.join(', ')}` }
  }
  const numbers = Object.fromEntries(REQUIRED.map((key) => [key, portion[key]])) as Record<RequiredKey, number>
  const nonPositive = POSITIVE.filter((key) => numbers[key] <= 0)
  if (nonPositive.length > 0) {
    return { error: `measurement.portion needs positive ${nonPositive.join(', ')}` }
  }

  const subject = isRecord(raw['subject']) ? raw['subject'] : {}
  return {
    seedX: optionalNumber(subject['seedX']),
    seedY: optionalNumber(subject['seedY']),
    ...numbers,
    viewAngle: optionalNumber(portion['viewAngle']),
    // records saved before 2026-09-25 have neither
    fill: optionalNumber(portion['fill']) ?? numbers.meanHeight / numbers.maxHeight,
    meanWidth: optionalNumber(portion['meanWidth']) ?? numbers.area / numbers.length,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function optionalNumber(value: unknown): number | null {
  return isFiniteNumber(value) ? value : null
}
