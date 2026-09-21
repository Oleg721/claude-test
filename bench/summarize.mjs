// Folds a run's raw/*.json into summary.md, summary.csv and all-runs.json next to them.
// Usage: node bench/summarize.mjs <run dir>
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const runDir = resolve(process.argv[2] ?? '')
if (!process.argv[2] || !existsSync(join(runDir, 'raw'))) {
  console.error('usage: node bench/summarize.mjs <run dir>   (a folder with raw/*.json from bench/run.mjs)')
  process.exit(1)
}
const rawDir = join(runDir, 'raw')

const runs = []
for (const file of (await readdir(rawDir)).filter((name) => name.endsWith('.json')).sort()) {
  runs.push(JSON.parse(await readFile(join(rawDir, file), 'utf8')))
}
const manifest = existsSync(join(runDir, 'manifest.json')) ? JSON.parse(await readFile(join(runDir, 'manifest.json'), 'utf8')) : null
const configs = manifest?.configs ?? [...new Set(runs.map((run) => run.config ?? `${run.model}-${run.effort}`))]
const photos = manifest?.photos ?? [...new Set(runs.map((run) => run.photoId))].sort().map((id) => ({ id, file: runs.find((run) => run.photoId === id).file }))
const configOf = (run) => run.config ?? `${run.model}-${run.effort}`
runs.sort((a, b) => a.photoId.localeCompare(b.photoId) || configs.indexOf(configOf(a)) - configs.indexOf(configOf(b)))

const cell = (value) => (value === null || value === undefined ? '' : String(value))
const num = (value, digits) => (typeof value === 'number' ? value.toFixed(digits) : '')
const mean = (values) => (values.length ? values.reduce((total, value) => total + value, 0) / values.length : NaN)
const label = (photo) => photo.label ?? photo.file
const BREAD_UNIT_CARBS = 12

// A single turn carries at most ~7k input tokens (prompt + one image ≤ 2576 px); a structured-output retry adds a ~29k prefix.
function turns(stats) {
  const usage = stats.usage
  return usage.input + usage.cacheWrite + usage.cacheRead > 12000 ? 2 : 1
}

// ---------- flat rows: one per (call, item) ----------
const rows = []
for (const run of runs) {
  const stats = run.response?.stats
  const usage = stats?.usage ?? {}
  const photo = photos.find((candidate) => candidate.id === run.photoId) ?? { id: run.photoId, file: run.file }
  const base = {
    photo: run.photoId,
    file: run.file,
    label: label(photo),
    truthGrams: photo.grams ?? '',
    config: configOf(run),
    ok: run.ok,
    httpStatus: run.httpStatus,
    error: run.error ?? run.response?.error ?? '',
    turns: stats ? turns(stats) : '',
    imageWidth: stats?.image?.width ?? '',
    imageHeight: stats?.image?.height ?? '',
    tokensInput: usage.input ?? '',
    tokensCacheWrite: usage.cacheWrite ?? '',
    tokensCacheRead: usage.cacheRead ?? '',
    tokensOutput: usage.output ?? '',
    costUsd: stats?.cost?.totalUsd ?? '',
    durationMs: stats?.durationMs ?? '',
    elapsedMs: run.elapsedMs,
  }
  const items = run.response?.items ?? []
  if (items.length === 0) {
    rows.push({ ...base, itemIndex: '', itemCount: 0 })
    continue
  }
  items.forEach((item, index) => {
    rows.push({
      ...base,
      itemIndex: index + 1,
      itemCount: items.length,
      name: item.name,
      brand: item.brand,
      source: item.source,
      per100Kcal: item.per100g?.kcal,
      per100Protein: item.per100g?.protein,
      per100Fat: item.per100g?.fat,
      per100Carbs: item.per100g?.carbs,
      gramsEstimate: item.portionGrams?.estimate,
      gramsConfidence: item.portionGrams?.confidence,
      gramsBasis: item.portionGrams?.basis,
      portionKcal: item.portion?.kcal,
      portionProtein: item.portion?.protein,
      portionFat: item.portion?.fat,
      portionCarbs: item.portion?.carbs,
      portionXe: item.portion?.xe,
      notes: item.notes,
    })
  })
}

// ---------- CSV ----------
const columns = [
  'photo', 'file', 'label', 'truthGrams', 'config', 'ok', 'httpStatus', 'error', 'itemIndex', 'itemCount', 'name', 'brand', 'source',
  'per100Kcal', 'per100Protein', 'per100Fat', 'per100Carbs', 'gramsEstimate', 'gramsConfidence', 'gramsBasis',
  'portionKcal', 'portionProtein', 'portionFat', 'portionCarbs', 'portionXe',
  'turns', 'imageWidth', 'imageHeight', 'tokensInput', 'tokensCacheWrite', 'tokensCacheRead', 'tokensOutput', 'costUsd', 'durationMs', 'elapsedMs', 'notes',
]
const csvEscape = (value) => {
  const text = cell(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}
await writeFile(join(runDir, 'summary.csv'), [columns.join(','), ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(','))].join('\n'))

// ---------- Markdown ----------
const md = []
md.push(`# Photo benchmark — ${manifest?.createdAt?.slice(0, 10) ?? runDir}`, '')
md.push(`Calls: ${runs.length} (${runs.filter((run) => run.ok).length} ok). Photos: ${photos.length}. Configs: ${configs.join(', ')}.`, '')
md.push('per 100 g as the model reported it; portion = per 100 g × estimated grams (server-side); tokens: in = uncached input, cache w/r = prompt-cache write/read, out = output; cost = the server estimate (`stats.cost`); ⟲ = the call needed a second turn (structured-output retry).', '')

md.push('## Totals per config', '')
md.push('| config | calls | ok | retries | Σ cost USD | avg cost | min / max cost | avg in | avg cache w | avg cache r | avg out | avg s | max s |')
md.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|')
for (const config of configs) {
  const group = runs.filter((run) => configOf(run) === config)
  const okRuns = group.filter((run) => run.ok && run.response?.stats)
  const pick = (fn) => okRuns.map((run) => fn(run.response.stats) ?? 0)
  const costs = pick((stats) => stats.cost?.totalUsd)
  const avg = (fn, digits) => (okRuns.length ? num(mean(pick(fn)), digits) : '')
  md.push(`| ${config} | ${group.length} | ${okRuns.length} | ${okRuns.filter((run) => turns(run.response.stats) > 1).length} | ${num(costs.reduce((a, b) => a + b, 0), 4)} | ${okRuns.length ? num(mean(costs), 4) : ''} | ${okRuns.length ? `${num(Math.min(...costs), 4)} / ${num(Math.max(...costs), 4)}` : ''} | ${avg((s) => s.usage.input, 0)} | ${avg((s) => s.usage.cacheWrite, 0)} | ${avg((s) => s.usage.cacheRead, 0)} | ${avg((s) => s.usage.output, 0)} | ${avg((s) => s.durationMs / 1000, 1)} | ${okRuns.length ? num(Math.max(...pick((s) => s.durationMs)) / 1000, 1) : ''} |`)
}
md.push('')

// ---------- weight / ХЕ accuracy for photos with a known weight ----------
const weighed = photos.filter((photo) => typeof photo.grams === 'number')
if (weighed.length > 0) {
  md.push('## Weight and ХЕ accuracy (photos with a known weight)', '')
  md.push(`Estimate in grams (signed error %) · ХЕ from the model's portion. Truth ХЕ = grams × carbsPer100 / 100 / ${BREAD_UNIT_CARBS} when carbsPer100 is given.`, '')
  md.push(`| photo | truth | ${configs.join(' | ')} |`)
  md.push(`|---|---|${configs.map(() => '---').join('|')}|`)
  const errors = Object.fromEntries(configs.map((config) => [config, { grams: [], xe: [] }]))
  for (const photo of weighed) {
    const truthXe = typeof photo.carbsPer100 === 'number' ? Math.round((photo.grams * photo.carbsPer100) / 100 / BREAD_UNIT_CARBS * 10) / 10 : null
    const cells = configs.map((config) => {
      const run = runs.find((candidate) => candidate.photoId === photo.id && configOf(candidate) === config)
      const item = run?.response?.items?.[0]
      if (!item) {
        return '—'
      }
      const estimate = item.portionGrams.estimate
      if (estimate === null) {
        return 'null'
      }
      const gramsError = (estimate - photo.grams) / photo.grams
      errors[config].grams.push(gramsError)
      const xe = item.portion?.xe
      if (truthXe !== null && typeof xe === 'number') {
        errors[config].xe.push(xe - truthXe)
      }
      return `${estimate} г (${gramsError > 0 ? '+' : ''}${Math.round(gramsError * 100)}%)${typeof xe === 'number' ? ` · ${xe} ХЕ` : ''}`
    })
    md.push(`| ${photo.id} | ${label(photo)} · ${photo.grams} г${truthXe !== null ? ` · ${truthXe} ХЕ` : ''} | ${cells.join(' | ')} |`)
  }
  const signed = (value) => `${value > 0 ? '+' : ''}${value}`
  md.push(`| **MAPE grams** |  | ${configs.map((config) => `${Math.round(mean(errors[config].grams.map(Math.abs)) * 100)}%`).join(' | ')} |`)
  md.push(`| **mean signed grams error** |  | ${configs.map((config) => `${signed(Math.round(mean(errors[config].grams) * 100))}%`).join(' | ')} |`)
  if (configs.some((config) => errors[config].xe.length > 0)) {
    md.push(`| **mean abs ХЕ error** |  | ${configs.map((config) => num(mean(errors[config].xe.map(Math.abs)), 2)).join(' | ')} |`)
    md.push(`| **mean signed ХЕ error** |  | ${configs.map((config) => signed(num(mean(errors[config].xe), 2))).join(' | ')} |`)
  }
  md.push('')
}

// ---------- per photo ----------
md.push('## Per photo', '')
for (const photo of photos) {
  const group = runs.filter((run) => run.photoId === photo.id)
  if (group.length === 0) {
    continue
  }
  md.push(`### ${photo.id} — ${label(photo)}${typeof photo.grams === 'number' ? ` · ${photo.grams} г` : ''}`, '', `File: \`${photo.file}\``, '')
  md.push('| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |')
  md.push('|---|---|---|---|---|---|---|---|---|---|---|---|')
  for (const run of group) {
    const config = configOf(run)
    if (!run.ok || !run.response?.stats) {
      md.push(`| ${config} | **ERROR ${run.httpStatus}** ${cell(run.error || run.response?.error)} |  |  |  |  |  |  |  |  | ${num(run.elapsedMs / 1000, 1)} |  |`)
      continue
    }
    const stats = run.response.stats
    const image = stats.image ? `${stats.image.width}×${stats.image.height}` : ''
    const tokens = `${stats.usage.input} / ${stats.usage.cacheWrite} / ${stats.usage.cacheRead} / ${stats.usage.output}`
    const cost = `${num(stats.cost?.totalUsd, 4)}${turns(stats) > 1 ? ' ⟲' : ''}`
    const items = run.response.items
    if (items.length === 0) {
      md.push(`| ${config} | (no items) |  |  |  |  |  | ${image} | ${tokens} | ${cost} | ${num(stats.durationMs / 1000, 1)} |  |`)
      continue
    }
    items.forEach((item, index) => {
      const first = index === 0
      const per100 = `${cell(item.per100g.kcal)} / ${cell(item.per100g.protein)} / ${cell(item.per100g.fat)} / ${cell(item.per100g.carbs)}`
      const grams = item.portionGrams.estimate === null ? `— (${item.portionGrams.confidence})` : `${item.portionGrams.estimate} (${item.portionGrams.confidence})`
      const portion = item.portion ? `${item.portion.kcal} / ${item.portion.protein} / ${item.portion.fat} / ${item.portion.carbs} / ${item.portion.xe}` : '—'
      const name = item.brand ? `${item.name} (${item.brand})` : item.name
      const notes = cell(item.notes).replace(/\|/g, '\\|').replace(/\n/g, ' ')
      md.push(`| ${first ? config : '↳'} | ${name} | ${item.source} | ${per100} | ${grams} | ${cell(item.portionGrams.basis)} | ${portion} | ${first ? image : ''} | ${first ? tokens : ''} | ${first ? cost : ''} | ${first ? num(stats.durationMs / 1000, 1) : ''} | ${notes} |`)
    })
  }
  md.push('')
}
await writeFile(join(runDir, 'summary.md'), md.join('\n'))
await writeFile(join(runDir, 'all-runs.json'), JSON.stringify(runs, null, 2))
console.log(`${runDir}/summary.md — ${runs.length} calls, ${rows.length} rows, ${runs.filter((run) => run.ok).length} ok`)
