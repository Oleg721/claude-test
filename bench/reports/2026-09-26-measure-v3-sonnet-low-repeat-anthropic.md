# Photo benchmark — 2026-09-26

Calls: 1 (1 ok). Photos: 1. Configs: sonnet-low-nothink@anthropic.

per 100 g as the model reported it; portion = per 100 g × estimated grams (server-side; for a measured still, × the edible grams); tokens: in = uncached input, cache w/r = prompt-cache write/read, out = output; cost = the server estimate (`stats.cost`); ⟲ = the call needed a second turn (structured-output retry). Stills sent with a Measure JSON (`/portion/photo`) also show low–high, the edible part and the geometry the model used.

## Totals per config

| config | calls | ok | retries | Σ cost USD | avg cost | min / max cost | avg in | avg cache w | avg cache r | avg out | avg s | max s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sonnet-low-nothink@anthropic | 1 | 1 | 0 | 0.0148 | 0.0148 | 0.0148 / 0.0148 | 6222 | 0 | 0 | 235 | 4.8 | 4.8 |

## Weight and ХЕ accuracy (photos with a known weight)

Estimate in grams (signed error %) · ХЕ from the model's portion. Truth ХЕ = grams × carbsPer100 / 100 / 12 when carbsPer100 is given.

| photo | truth | sonnet-low-nothink@anthropic |
|---|---|---|
| p01 | apple, whole, on the table · 314 г · 3.6 ХЕ | 190 г (-39%) · 2 ХЕ |
| **MAPE grams** |  | 39% |
| **mean signed grams error** |  | -39% |
| **mean abs ХЕ error** |  | 1.60 |
| **mean signed ХЕ error** |  | -1.60 |

## Per photo

### p01 — apple, whole, on the table · 314 г

File: `07087FFB-01D3-4567-92A4-5BBE3638427D.jpg`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sonnet-low-nothink@anthropic | Яблоко зелёное |  | 52 / 0.3 / 0.2 / 14 | 190 171–209 (high) | 171 g (0.9, семенная коробочка, черенок) · 452.86 ml × 0.87 × 0.8 | volume 453 ml × 0.87 (A) × 0.80 = 190 g; gates a–d pass; edible 0.90 → 171 g | 89 / 0.5 / 0.3 / 23.9 / 2 | 960×1280 | 6222 / 0 / 0 / 235 | 0.0148 | 4.8 |  |
