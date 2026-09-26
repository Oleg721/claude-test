import { LLM_BACKENDS, type LlmBackend, type LlmEffort } from '../llm/index.js'
import { KNOWN_MODELS, resolveModel } from '../models.js'
import type { AnalyzePhotoInput } from './nutrition.service.js'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
// what the normalizer decodes; the port only ever receives the re-encoded JPEG
const PHOTO_MEDIA_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const EFFORTS: readonly LlmEffort[] = ['low', 'medium', 'high', 'max']
const DEFAULT_EFFORT: LlmEffort = 'low'
const DEFAULT_BACKEND: LlmBackend = 'agent-sdk'

export type RequestError = { error: string }

/** multipart/form-data → service input: photo (file, required), grams?, hint?, model?, effort?, thinking?, backend? */
export async function parsePhotoRequest(
  body: Record<string, unknown>,
  available: readonly LlmBackend[],
): Promise<AnalyzePhotoInput | RequestError> {
  const photo = body['photo']
  if (!(photo instanceof File)) {
    return { error: 'multipart field "photo" (file) is required' }
  }
  if (!PHOTO_MEDIA_TYPES.includes(photo.type)) {
    return { error: `photo must be one of ${PHOTO_MEDIA_TYPES.join(', ')}; got "${photo.type || 'unknown'}"` }
  }
  if (photo.size === 0 || photo.size > MAX_PHOTO_BYTES) {
    return { error: `photo must be between 1 and ${MAX_PHOTO_BYTES} bytes; got ${photo.size}` }
  }

  const model = resolveModel(optionalString(body['model']))
  if (model === null) {
    return { error: `unknown model; known: ${KNOWN_MODELS.join(', ')}` }
  }

  const rawEffort = optionalString(body['effort'])
  const effort = rawEffort === undefined ? DEFAULT_EFFORT : EFFORTS.find((level) => level === rawEffort)
  if (effort === undefined) {
    return { error: `effort must be one of ${EFFORTS.join(', ')}` }
  }

  const rawBackend = optionalString(body['backend'])
  const backend = rawBackend === undefined ? DEFAULT_BACKEND : LLM_BACKENDS.find((known) => known === rawBackend)
  if (backend === undefined) {
    return { error: `backend must be one of ${LLM_BACKENDS.join(', ')}` }
  }
  if (!available.includes(backend)) {
    return { error: `backend "${backend}" is not configured — put its key in .env; available: ${available.join(', ')}` }
  }

  const rawThinking = optionalString(body['thinking'])
  const thinking = rawThinking === undefined ? true : { on: true, off: false }[rawThinking]
  if (thinking === undefined) {
    return { error: 'thinking must be "on" or "off"' }
  }

  const rawGrams = optionalString(body['grams'])
  const grams = rawGrams === undefined ? null : Number(rawGrams)
  const gramsInvalid = grams !== null && !(Number.isFinite(grams) && grams > 0)
  if (gramsInvalid) {
    return { error: 'grams must be a positive number' }
  }

  const bytes = Buffer.from(await photo.arrayBuffer())

  return { photo: bytes, backend, model, effort, thinking, hint: optionalString(body['hint']) ?? null, grams }
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}
