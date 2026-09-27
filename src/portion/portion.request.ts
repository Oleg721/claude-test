import type { LlmBackend } from '../llm/index.js'
import { parsePhotoRequest, type RequestError } from '../nutrition/nutrition.request.js'
import { parseMeasurement } from './portion.measurement.js'
import type { AnalyzePortionInput } from './portion.service.js'

/** multipart/form-data → service input: what /nutrition/photo takes, plus `measurement` (the Measure JSON as text, required). */
export async function parsePortionRequest(
  body: Record<string, unknown>,
  available: readonly LlmBackend[],
): Promise<AnalyzePortionInput | RequestError> {
  // v5's working model, see health/docs/nutrition/portion-prompts-v5.md "Working model"
  const base = await parsePhotoRequest({ model: 'sonnet', thinking: 'off', ...body }, available)
  if ('error' in base) {
    return base
  }

  const raw = body['measurement']
  if (typeof raw !== 'string' || raw.trim() === '') {
    return { error: 'multipart field "measurement" (the Measure JSON as text) is required' }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { error: 'measurement is not valid JSON' }
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { error: 'measurement must be a JSON object' }
  }

  // only the geometry numbers go on; the calibration `note` and the rest of the record stop here
  const measurement = parseMeasurement(parsed as Record<string, unknown>)
  if ('error' in measurement) {
    return measurement
  }

  return {
    photo: base.photo,
    backend: base.backend,
    model: base.model,
    effort: base.effort,
    thinking: base.thinking,
    hint: base.hint,
    measurement,
  }
}
