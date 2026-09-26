# Photo benchmark — 2026-09-26

Calls: 1 (1 ok). Photos: 1. Configs: haiku-low@anthropic.

per 100 g as the model reported it; portion = per 100 g × estimated grams (server-side; for a measured still, × the edible grams); tokens: in = uncached input, cache w/r = prompt-cache write/read, out = output; cost = the server estimate (`stats.cost`); ⟲ = the call needed a second turn (structured-output retry). Stills sent with a Measure JSON (`/portion/photo`) also show low–high, the edible part and the geometry the model used.

## Totals per config

| config | calls | ok | retries | Σ cost USD | avg cost | min / max cost | avg in | avg cache w | avg cache r | avg out | avg s | max s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| haiku-low@anthropic | 1 | 1 | 0 | 0.0247 | 0.0247 | 0.0247 / 0.0247 | 5400 | 0 | 0 | 3870 | 54.0 | 54.0 |

## Weight and ХЕ accuracy (photos with a known weight)

Estimate in grams (signed error %) · ХЕ from the model's portion. Truth ХЕ = grams × carbsPer100 / 100 / 12 when carbsPer100 is given.

| photo | truth | haiku-low@anthropic |
|---|---|---|
| p01 | apple, whole, on the table · 314 г · 3.6 ХЕ | 315 г (+0%) · 3.3 ХЕ |
| **MAPE grams** |  | 0% |
| **mean signed grams error** |  | 0% |
| **mean abs ХЕ error** |  | 0.30 |
| **mean signed ХЕ error** |  | -0.30 |

## Per photo

### p01 — apple, whole, on the table · 314 г

File: `07087FFB-01D3-4567-92A4-5BBE3638427D.jpg`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| haiku-low@anthropic | зелёное яблоко |  | 52 / 0.3 / 0.2 / 13.8 | 315 284–347 (high) | 284 g (0.9, core) · 453 ml × 0.87 × 0.8 | volume 453 ml × 0.87 (A) × 0.80 = 315 g; gates a–d pass; edible 0.90 → 284 g | 148 / 0.9 / 0.6 / 39.2 / 3.3 | 960×1280 | 5400 / 0 / 0 / 3870 | 0.0247 | 54.0 |  |
