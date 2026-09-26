# Photo benchmark — 2026-09-26

Calls: 2 (2 ok). Photos: 2. Configs: haiku-low-nothink@anthropic.

per 100 g as the model reported it; portion = per 100 g × estimated grams (server-side; for a measured still, × the edible grams); tokens: in = uncached input, cache w/r = prompt-cache write/read, out = output; cost = the server estimate (`stats.cost`); ⟲ = the call needed a second turn (structured-output retry). Stills sent with a Measure JSON (`/portion/photo`) also show low–high, the edible part and the geometry the model used.

## Totals per config

| config | calls | ok | retries | Σ cost USD | avg cost | min / max cost | avg in | avg cache w | avg cache r | avg out | avg s | max s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| haiku-low-nothink@anthropic | 2 | 2 | 0 | 0.0131 | 0.0066 | 0.0062 / 0.0069 | 5371 | 0 | 0 | 238 | 8.0 | 9.2 |

## Weight and ХЕ accuracy (photos with a known weight)

Estimate in grams (signed error %) · ХЕ from the model's portion. Truth ХЕ = grams × carbsPer100 / 100 / 12 when carbsPer100 is given.

| photo | truth | haiku-low-nothink@anthropic |
|---|---|---|
| p01 | apple, whole, on the table · 314 г · 3.6 ХЕ | 383 г (+22%) · 4 ХЕ |
| p02 | banana in its peel, on a chopping board · 157 г · 3 ХЕ | 157 г (0%) · 1.9 ХЕ |
| **MAPE grams** |  | 11% |
| **mean signed grams error** |  | +11% |
| **mean abs ХЕ error** |  | 0.75 |
| **mean signed ХЕ error** |  | -0.35 |

## Per photo

### p01 — apple, whole, on the table · 314 г

File: `07087FFB-01D3-4567-92A4-5BBE3638427D.jpg`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| haiku-low-nothink@anthropic | зелёное яблоко |  | 52 / 0.26 / 0.17 / 13.81 | 383 344–421 (high) | 345 g (0.9, кожица и сердцевина) · 453 ml × 0.87 × 0.8 | volume 453 ml × 0.87 (A) × 0.80 = 315 g; gates a–d pass; плotovanie residual 1.1 mm; edible 0.90 → 283 g eaten; whole apple 315 g is the estimate, rounded to 383 g after recalibration with density check: area 59.6 cm² × 8.5 cm height × 0.87 factor × 0.80 density = 349 g, average with volume method gives ~383 g | 179 / 0.9 / 0.6 / 47.6 / 4 | 960×1280 | 5370 / 0 / 0 / 302 | 0.0069 | 9.2 |  |

### p02 — banana in its peel, on a chopping board · 157 г

File: `EAB8A480-0CF8-4055-BD4A-7B74C3E36A85.jpg`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| haiku-low-nothink@anthropic | банан |  | 89 / 1.1 / 0.3 / 22.8 | 157 141–173 (high) | 102 g (0.65, peel) · 190 ml × 0.87 × 0.95 | volume 190 ml × 0.87 (B) × 0.95 = 157 g; gates a–d pass; edible 0.65 → 102 g | 91 / 1.1 / 0.3 / 23.3 / 1.9 | 960×1280 | 5372 / 0 / 0 / 173 | 0.0062 | 6.8 |  |
