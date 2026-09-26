# Photo benchmark

Runs a folder of photos through `POST /nutrition/photo` for several model × effort configs and folds the answers into one table: what was recognized, per-100 g macros, estimated grams, portion with bread units, tokens, cost, duration. Use it to compare models, efforts, prompt changes or image sizes on the same photos.

## Run

```bash
npm run dev                                   # the server must be up on :3000 (or pass --base-url)
mkdir -p bench/photos/fruit && cp ~/Pictures/*.jpeg bench/photos/fruit/
npm run bench -- --photos bench/photos/fruit --configs opus-low,sonnet-low,haiku-low
npm run bench:summary -- bench/runs/<date>-fruit
open bench/runs/<date>-fruit/summary.md
```

`bench/photos/` and `bench/runs/` are git-ignored: photos are personal, runs are data. Copy a `summary.md` worth keeping into `bench/reports/`.

Options of `bench/run.mjs`:

- `--photos <dir>` — JPEG / PNG / WebP / GIF, sorted by name, numbered `p01…` in that order (the mapping is written to `manifest.json`).
- `--configs a,b,c` — `<model>-<effort>[-nothink][@<backend>]`, model = alias (`opus`, `sonnet`, `haiku`, `fable`) or full id, effort = `low | medium | high | max`, `-nothink` sends `thinking=off`, `@anthropic` / `@openrouter` sends `backend=` (default `agent-sdk`, the subscription). Default `opus-low`. One run may mix backends, e.g. `sonnet-low-nothink,sonnet-low-nothink@anthropic`, to compare them in one table.
- `--out <dir>` — run folder, default `bench/runs/<date>-<photos folder name>`.
- `--concurrency 3` — parallel calls. `--resume` — skip calls whose raw file already exists (rerun after failures).

No hint and no grams are sent: the benchmark measures what the model does on its own.

## Measured stills

A photo with a JSON of the same name next to it (`<uuid>.jpg` + `<uuid>.json`, the pair Plate's Measure screen saves) is sent to `POST /portion/photo` with that JSON as `measurement`; the other photos still go to `/nutrition/photo`, so one folder may hold both kinds. HEIC stills are converted with `sips` into `<run>/jpeg/` first (sharp cannot decode HEIC). The record's `note`, when it is a weight (`157 g`), becomes the photo's truth grams unless `truth.json` gives one; the server strips the note before the model sees it. The tables then show the low–high range, the edible part and the geometry the model used; the accuracy section compares `portionGrams.estimate` (the item as it lies, peel included) with the scale, and the ХЕ column is from the edible grams, so against a whole-item truth it reads low by the peel.

## Ground truth

Put a `truth.json` next to the photos to get the accuracy section (weight error and ХЕ error per config):

```json
{
  "IMG_1917.jpeg": { "label": "half green apple + teaspoon", "grams": 130, "carbsPer100": 13.8 },
  "IMG_1924.jpeg": { "label": "pear + teaspoon", "grams": 200, "carbsPer100": 15.2 },
  "trik.jpeg": { "label": "Trik Banini back label, 200 g; per 100 g 480 kcal / F 23 / C 51 / P 15" }
}
```

`label` is free text shown in the tables; `grams` and `carbsPer100` (reference table of your choice, e.g. USDA apple 13.8, pear 15.2) are optional and drive the accuracy rows.

## Output

- `raw/<photo>__<config>.json` — the full server response per call, plus HTTP status and timing.
- `summary.md` — totals per config, accuracy (if truth given), one table per photo.
- `summary.csv` — one row per (call, item), for Numbers / Excel.
- `all-runs.json` — all raw records in one file.

Reading the tables: cost is the server's `stats.cost` (price table in `src/llm/pricing.ts`); `⟲` marks a call that needed a second turn — the Agent SDK backend retries a structured output that failed its schema, and that retry carries a ~29k-token prefix (Sonnet 5 does it in most calls, Opus 5 and Haiku 4.5 never — see `src/llm/README.md`). `image` is the size the model actually saw after `src/images/normalize.ts`.

## Reports

- `reports/2026-09-26-measure-v3.md` — the first two Measure stills (apple 314 g, banana 157 g in its peel) × opus/sonnet/haiku at low, prompt v3: 315 and 157 g on every model.
- `reports/2026-09-26-measure-v3-nothink.md` — the same with `thinking=off`: identical grams; haiku from $0.02–0.05 and 24–90 s down to $0.01 and 11 s, opus and sonnet unchanged.
- `reports/2026-09-26-measure-v3-haiku-anthropic.md` — the same two stills through the Messages API (`haiku-low-nothink@anthropic`), the first run on a key: banana 157 g, apple 383 g (Haiku averaged the computed 315 g with a second formula it made up); $0.0066 and 7–9 s a call.
- `reports/2026-09-26-measure-v3-sonnet-anthropic.md` — the same with `sonnet-low-nothink@anthropic`: 315 and 157 g to the gram, confidence medium on both, no structured-output retry (the Agent SDK double-wrap does not exist on the API); $0.0155 and 7–8 s a call.

- `reports/2026-09-20-preview-1024px.md` — 13 photos (9 fruits, 4 labels) × haiku/sonnet/opus, low and medium; 1024 px previews, before normalization existed.
- `reports/2026-09-20-originals-2000px.md` — the 4 hardest fruit photos as originals (the backend capped them at 2000 px) × sonnet/opus × low/medium/high.

Both were produced by earlier versions of these scripts, cost recomputed with the 1-hour cache-write multiplier; they are the basis for the opus-low default in `src/models.ts`.
