import { parsePhotoRequest, type RequestError } from '../nutrition/nutrition.request.js'
import type { AnalyzePortionInput } from './portion.service.js'

/** multipart/form-data → service input: what /nutrition/photo takes, plus `measurement` (the Measure JSON as text, required). */
export async function parsePortionRequest(body: Record<string, unknown>): Promise<AnalyzePortionInput | RequestError> {
  const base = await parsePhotoRequest(body)
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

  // `note` holds the kitchen scale's reading during calibration; the model must not see it
  const measurement = { ...(parsed as Record<string, unknown>) }
  delete measurement['note']

  return { photo: base.photo, model: base.model, effort: base.effort, thinking: base.thinking, hint: base.hint, measurement }
}
