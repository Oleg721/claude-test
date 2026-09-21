// Sends every photo of a folder to POST /nutrition/photo once per model/effort config and keeps one raw JSON per call.
// Usage: node bench/run.mjs --photos <dir> [--configs opus-low,sonnet-medium] [--out bench/runs/<name>] [--concurrency 3] [--base-url http://localhost:3000] [--resume]
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { parseArgs } from 'node:util'

const USAGE = 'usage: node bench/run.mjs --photos <dir> [--configs opus-low,sonnet-low] [--out <run dir>] [--concurrency 3] [--base-url http://localhost:3000] [--resume]'
const PHOTO_FILE = /\.(jpe?g|png|webp|gif)$/i

const { values: args } = parseArgs({
  options: {
    photos: { type: 'string' },
    out: { type: 'string' },
    configs: { type: 'string', default: 'opus-low' },
    concurrency: { type: 'string', default: '3' },
    'base-url': { type: 'string', default: 'http://localhost:3000' },
    resume: { type: 'boolean', default: false },
  },
})
if (!args.photos) {
  console.error(USAGE)
  process.exit(1)
}

const photosDir = resolve(args.photos)
const runDir = resolve(args.out ?? join('bench/runs', `${new Date().toISOString().slice(0, 10)}-${basename(photosDir)}`))
const rawDir = join(runDir, 'raw')
const configs = args.configs.split(',').map(parseConfig)
const concurrency = Number(args.concurrency)

// "opus-low" or "claude-opus-5-low": the effort is the last dash-separated part, the model is the rest (alias or full id)
function parseConfig(text) {
  const at = text.lastIndexOf('-')
  if (at <= 0) {
    throw new Error(`config "${text}" must look like <model>-<effort>`)
  }
  return { id: text, model: text.slice(0, at), effort: text.slice(at + 1) }
}

const files = (await readdir(photosDir)).filter((name) => PHOTO_FILE.test(name)).sort()
if (files.length === 0) {
  console.error(`no photos in ${photosDir}`)
  process.exit(1)
}
const truth = await readTruth(photosDir)
const photos = files.map((file, index) => ({ id: `p${String(index + 1).padStart(2, '0')}`, file, ...(truth[file] ?? {}) }))

await mkdir(rawDir, { recursive: true })
await writeFile(
  join(runDir, 'manifest.json'),
  JSON.stringify({ createdAt: new Date().toISOString(), baseUrl: args['base-url'], photosDir, configs: configs.map((config) => config.id), photos }, null, 2),
)

const jobs = []
for (const photo of photos) {
  for (const config of configs) {
    jobs.push({ photo, config })
  }
}
console.log(`${photos.length} photos × ${configs.length} configs = ${jobs.length} calls → ${runDir}`)

async function runJob({ photo, config }) {
  const outPath = join(rawDir, `${photo.id}__${config.id}.json`)
  if (args.resume && existsSync(outPath)) {
    console.log(`skip ${photo.id} ${config.id} (exists)`)
    return
  }
  const bytes = await readFile(join(photosDir, photo.file))
  const form = new FormData()
  form.append('photo', new File([bytes], photo.file, { type: mediaType(photo.file) }))
  form.append('model', config.model)
  form.append('effort', config.effort)

  const startedAt = Date.now()
  let status = 0
  let body = null
  let error = null
  try {
    const response = await fetch(`${args['base-url']}/nutrition/photo`, { method: 'POST', body: form })
    status = response.status
    const text = await response.text()
    try {
      body = JSON.parse(text)
    } catch {
      body = { raw: text }
    }
  } catch (caught) {
    error = String(caught)
  }
  const record = {
    photoId: photo.id,
    file: photo.file,
    config: config.id,
    model: config.model,
    effort: config.effort,
    requestedAt: new Date(startedAt).toISOString(),
    elapsedMs: Date.now() - startedAt,
    httpStatus: status,
    ok: status === 200,
    error,
    response: body,
  }
  await writeFile(outPath, JSON.stringify(record, null, 2))
  console.log(`${record.ok ? 'ok ' : 'ERR'} ${photo.id} ${config.id} ${status} ${record.elapsedMs}ms`)
}

function mediaType(file) {
  const ext = file.toLowerCase().replace(/^.*\./, '')
  return { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' }[ext]
}

// Optional truth.json next to the photos: { "<file>": { "label": "…", "grams": 130, "carbsPer100": 13.8 } }
async function readTruth(dir) {
  const path = join(dir, 'truth.json')
  if (!existsSync(path)) {
    return {}
  }
  return JSON.parse(await readFile(path, 'utf8'))
}

let cursor = 0
async function worker() {
  while (cursor < jobs.length) {
    await runJob(jobs[cursor++])
  }
}
await Promise.all(Array.from({ length: concurrency }, worker))
console.log(`done: ${jobs.length} calls; next: node bench/summarize.mjs ${runDir}`)
