# CLAUDE.md

API playground for experiments with Claude. Hono + Node, native ESM, TypeScript.

## Commands

```bash
npm run dev         # dev server with hot reload (tsx watch) on http://localhost:3000
npm run typecheck   # tsc --noEmit — run before claiming done
npm run build       # compile to dist/
npm run start       # run compiled output
npm run bench -- --photos <dir> --configs opus-low,sonnet-low   # photo benchmark, see bench/README.md
npm run bench:summary -- bench/runs/<run>                        # fold a run into summary.md / .csv
```

No test suite. `main.ts` loads `.env` (git-ignored) for the keyed backends: `ANTHROPIC_API_KEY`
enables `backend=anthropic`, `OPENROUTER_API_KEY` enables `backend=openrouter`. The default
backend stays the Agent SDK on the personal Claude subscription; its adapter hides the key and
route variables (`ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_BASE_URL`,
`OPENROUTER_API_KEY`) from the CLI, so a key in `.env` never switches the subscription to key billing.

## Layout

```
src/
  main.ts                  serve on :3000
  app.ts                   Hono app, logger, mounts feature routes, global error handler (LlmError → 502)
  models.ts                default model + alias → full id (HTTP side only)
  images/normalize.ts      sharp: EXIF rotation, ≤ 1568 px long edge, JPEG q85 — every photo passes through it
  llm/                     the LLM port — rules in llm/README.md, read them first
    port.ts                LlmPort, LlmRequest, LlmResult, LlmUsage, LlmError
    pricing.ts             price table + cost from token counts
    adapters/              one file per backend: agent-sdk (subscription), messages-api (Anthropic / OpenRouter by key)
    index.ts               createLlm() — the configured set of backends, one line per provider
  nutrition/               POST /nutrition/photo — macros from a food / label photo
    nutrition.prompt.ts    system prompt + JSON schema + result types
    nutrition.request.ts   multipart body → validated service input
    nutrition.service.ts   the use case: normalize photo → port call → portions → cost → result
    nutrition.calc.ts      portion macros + bread units (pure)
    nutrition.route.ts     parse → service → json, nothing else
  portion/                 POST /portion/photo — grams from a photo plus Plate's Measure JSON (LiDAR geometry)
    portion.prompt.ts      system prompt (verbatim from health/docs/nutrition/portion-prompts-v3.md) + schema + types
    portion.request.ts     /nutrition/photo's fields plus `measurement`; strips the calibration `note`
    portion.service.ts     normalize photo → port call → edible portion → cost → result
    portion.route.ts       parse → service → json
bench/                     photo benchmark: run.mjs + summarize.mjs + reports/ (photos/ and runs/ are git-ignored)
```

## Rules

- All LLM calls go through `LlmPort` (`src/llm`). Never import a vendor SDK outside
  `src/llm/adapters/`. The port contract and the forbidden list live in `src/llm/README.md`.
  Routes take the `LlmPorts` set and pick the adapter by the request's `backend`.
- Layering inside a feature: **route** parses the request and returns the service result
  as JSON; **request** file turns the wire body into a validated, typed service input;
  **service** owns the use case (port call, domain calculations, cost, timing) and returns a
  plain result object; **calc** files hold pure helpers. No domain logic in a route.
- Errors: throw, don't map in routes — `app.onError` in `app.ts` turns `LlmError` into
  `502 { error, code }` and anything else into `500`. Validation failures return `400 { error }`.
- A feature = its own folder with `*.prompt.ts` / `*.request.ts` / `*.service.ts` /
  `*.route.ts`; routes are mounted in `app.ts`.
- Code, comments and docs in English.

## Models

Aliases accepted on the HTTP side (`src/models.ts`) and the pinned id the port receives:

| alias    | id                          |
| -------- | --------------------------- |
| `fable`  | `claude-fable-5-1`          |
| `opus`   | `claude-opus-5` (default)   |
| `sonnet` | `claude-sonnet-5`           |
| `haiku`  | `claude-haiku-4-5-20251001` |

Prices in `src/llm/pricing.ts`, verified 2026-09-20; cache writes are billed as 1-hour entries
(2× input), which is what the Agent SDK backend creates. Haiku 4.5 does not support `effort`
on the Messages API; the Agent SDK tolerates it.

Default = opus at `effort: low`, picked on the 2026-09-20 photo benchmark (13 photos ×
5 configs, then 4 originals × 6 configs): no structured-output retries, the most reliable
label reading, fastest responses; higher effort bought no accuracy. Sonnet retries the
structured output on the Agent SDK backend in most calls (see `src/llm/README.md`, "Known
non-equivalence"), which with caching off makes it dearer than opus; haiku misreads blurry
labels.

## Endpoints

- `GET /` — health.
- `POST /nutrition/photo` — `multipart/form-data`: `photo` (JPEG/PNG/WebP/GIF, ≤ 5 MB,
  required), `grams` (positive number, optional — skips the weight estimate), `hint`
  (text, optional), `model` (alias or full id, default opus), `effort` (`low` | `medium` |
  `high` | `max`, default low), `thinking` (`on` | `off`, default on: adaptive thinking, or a
  16k-token budget on Haiku 4.5, which has no adaptive mode; off disables it), `backend` (`agent-sdk` | `anthropic` | `openrouter`, default
  agent-sdk; a keyed backend without its key in the environment or `.env` is a 400). The photo is normalized before the model sees it: EXIF
  rotation applied, long edge capped at 1568 px (never enlarged), re-encoded as JPEG q85,
  metadata dropped — 1568 px stays under every model tier's downscale limit and costs
  ~2.4k visual tokens at 4:3 (`⌈w/28⌉ × ⌈h/28⌉`). Prompt caching is off for this call: a photo
  is never sent twice. Returns `items[]` with per-100 g macros, the portion (given or
  estimated grams → kcal/protein/fat/carbs/xe) and `stats` (backend, model, effort, thinking,
  the normalized `image` size, usage, estimated cost, duration).

  ```bash
  curl -s -F photo=@apple.jpg -F grams=180 http://localhost:3000/nutrition/photo | jq
  ```

  Postman: import `postman/claude-test.postman_collection.json` (variable `baseUrl`).

- `POST /portion/photo` — the same fields as `/nutrition/photo` plus `measurement` (text,
  required): the JSON Plate's Measure screen saves next to the still (footprint, heights,
  volume, plane fit, view angle…). The model turns that geometry into grams by the algorithm
  in `health/docs/nutrition/portion-prompts-v3.md`; the prompt in `src/portion/portion.prompt.ts`
  is a verbatim copy, and a new prompt version is a new file there first. `measurement.note`
  (the kitchen scale during calibration) is removed before the call. Returns `items[]` with
  `portionGrams` (the item as it lies in the photo, with low/high), `edible` (grams, share,
  what is removed — null when the whole item is eaten), `geometry` (volume × shape factor ×
  density the model used), the `portion` macros of what is eaten, and the same `stats`.

  ```bash
  curl -s -F photo=@still.jpg -F "measurement=$(cat still.json)" http://localhost:3000/portion/photo | jq
  ```
