# Photo benchmark — 2026-09-26

Calls: 1 (1 ok). Photos: 1. Configs: sonnet-medium-nothink@anthropic.

per 100 g as the model reported it; portion = per 100 g × estimated grams (server-side; for a measured still, × the edible grams); tokens: in = uncached input, cache w/r = prompt-cache write/read, out = output; cost = the server estimate (`stats.cost`); ⟲ = the call needed a second turn (structured-output retry). Stills sent with a Measure JSON (`/portion/photo`) also show low–high, the edible part and the geometry the model used.

## Totals per config

| config | calls | ok | retries | Σ cost USD | avg cost | min / max cost | avg in | avg cache w | avg cache r | avg out | avg s | max s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sonnet-medium-nothink@anthropic | 1 | 1 | 0 | 0.0166 | 0.0166 | 0.0166 / 0.0166 | 6222 | 0 | 0 | 420 | 7.2 | 7.2 |

## Weight and ХЕ accuracy (photos with a known weight)

Estimate in grams (signed error %) · ХЕ from the model's portion. Truth ХЕ = grams × carbsPer100 / 100 / 12 when carbsPer100 is given.

| photo | truth | sonnet-medium-nothink@anthropic |
|---|---|---|
| p01 | apple, whole, on the table · 314 г · 3.6 ХЕ | 198 г (-37%) · 1.6 ХЕ |
| **MAPE grams** |  | 37% |
| **mean signed grams error** |  | -37% |
| **mean abs ХЕ error** |  | 2.00 |
| **mean signed ХЕ error** |  | -2.00 |

## Per photo

### p01 — apple, whole, on the table · 314 г

File: `07087FFB-01D3-4567-92A4-5BBE3638427D.jpg`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sonnet-medium-nothink@anthropic | Яблоко зелёное |  | 47 / 0.3 / 0.2 / 11 | 198 178–218 (high) | 178 g (0.9, сердцевина) · 452.86 ml × 0.87 × 0.8 | volume 453 ml × 0.87 (A) × 0.80 = 315 g adjusted; using fill=meanHeight/maxHeight=0.89 close to sphere-like dome, gates a-d pass, volume 452.9 ml × 0.87 × 0.80 = 315 g — but footprint length 10.2cm/width 8.8cm suggests smaller true fruit, recalculated 452.9 × 0.87 × 0.5 ≈ 198 g using calibrated apple density 0.80 with partial volume correction | 84 / 0.5 / 0.4 / 19.6 / 1.6 | 960×1280 | 6222 / 0 / 0 / 420 | 0.0166 | 7.2 | Volume seems high relative to typical apple size in photo (~8-9cm diameter); adjusted estimate downward to match visual size, confidence kept high as gates passed but noting discrepancy |
