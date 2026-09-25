// Sends every photo of a folder to the server once per model/effort config and keeps one raw JSON per call.
// A photo with a Measure JSON next to it (same name, .json) goes to POST /portion/photo with it; the rest to POST /nutrition/photo.
// Usage: node bench/run.mjs --photos <dir> [--configs opus-low,sonnet-medium,haiku-low-nothink] [--out bench/runs/<name>] [--concurrency 3] [--base-url http://localhost:3000] [--resume]
import { execFile } from 'node:child_process'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { parseArgs, promisify } from 'node:util'

const USAGE = 'usage: node bench/run.mjs --photos <dir> [--configs opus-low,sonnet-low,haiku-low-nothink] [--out <run dir>] [--concurrency 3] [--base-url http://localhost:3000] [--resume]'
const PHOTO_FILE = /\.(jpe?g|png|webp|gif|heic)$/i
const execFileAsync = promisify(execFile)

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
const jpegDir = join(runDir, 'jpeg')
const configs = args.configs.split(',').map(parseConfig)
const concurrency = Number(args.concurrency)

// "opus-low", "claude-opus-5-low" or "haiku-low-nothink": an optional -nothink suffix, then the effort, the model is the rest (alias or full id)
function parseConfig(text) {
  const thinking = !text.endsWith('-nothink')
  const core = thinking ? text : text.slice(0, -'-nothink'.length)
  const at = core.lastIndexOf('-')
  if (at <= 0) {
    throw new Error(`config "${text}" must look like <model>-<effort>[-nothink]`)
  }
  return { id: text, model: core.slice(0, at), effort: core.slice(at + 1), thinking }
}

const files = (await readdir(photosDir)).filter((name) => PHOTO_FILE.test(name)).sort()
if (files.length === 0) {
  console.error(`no photos in ${photosDir}`)
  process.exit(1)
}
const truth = await readTruth(photosDir)
const photos = []
for (const [index, file] of files.entries()) {
  const measurement = await readMeasurement(photosDir, file)
  photos.push({ id: `p${String(index + 1).padStart(2, '0')}`, file, measurement, ...gramsFromNote(measurement), ...(truth[file] ?? {}) })
}

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
  const upload = await photoUpload(photo)
  const form = new FormData()
  form.append('photo', new File([upload.bytes], upload.name, { type: upload.type }))
  form.append('model', config.model)
  form.append('effort', config.effort)
  form.append('thinking', config.thinking ? 'on' : 'off')
  const route = photo.measurement ? '/portion/photo' : '/nutrition/photo'
  if (photo.measurement) {
    form.append('measurement', JSON.stringify(photo.measurement))
  }

  const startedAt = Date.now()
  let status = 0
  let body = null
  let error = null
  try {
    const response = await fetch(`${args['base-url']}${route}`, { method: 'POST', body: form })
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
    route,
    model: config.model,
    effort: config.effort,
    thinking: config.thinking,
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

// sharp cannot decode HEIC; on a Mac, sips can — the JPEG copy lands in <run>/jpeg/ and is reused on --resume
async function photoUpload(photo) {
  const source = join(photosDir, photo.file)
  if (!/\.heic$/i.test(photo.file)) {
    return { bytes: await readFile(source), name: photo.file, type: mediaType(photo.file) }
  }
  const name = photo.file.replace(/\.heic$/i, '.jpg')
  const target = join(jpegDir, name)
  if (!existsSync(target)) {
    await mkdir(jpegDir, { recursive: true })
    await execFileAsync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '90', source, '--out', target])
  }
  return { bytes: await readFile(target), name, type: 'image/jpeg' }
}

// <photo>.json next to the photo: the Measure record Plate saved with the still
async function readMeasurement(dir, file) {
  const path = join(dir, file.replace(/\.[^.]+$/, '.json'))
  return existsSync(path) ? JSON.parse(await readFile(path, 'utf8')) : null
}

// During calibration the record's `note` is the kitchen scale ("157 g"); it becomes the truth unless truth.json says otherwise
function gramsFromNote(measurement) {
  const match = /^(\d+(?:[.,]\d+)?)\s*(g|г)$/i.exec(measurement?.note ?? '')
  return match ? { grams: Number(match[1].replace(',', '.')) } : {}
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
