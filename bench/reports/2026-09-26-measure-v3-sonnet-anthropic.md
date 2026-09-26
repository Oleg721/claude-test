# Photo benchmark — 2026-09-26

Calls: 2 (2 ok). Photos: 2. Configs: sonnet-low-nothink@anthropic.

per 100 g as the model reported it; portion = per 100 g × estimated grams (server-side; for a measured still, × the edible grams); tokens: in = uncached input, cache w/r = prompt-cache write/read, out = output; cost = the server estimate (`stats.cost`); ⟲ = the call needed a second turn (structured-output retry). Stills sent with a Measure JSON (`/portion/photo`) also show low–high, the edible part and the geometry the model used.

## Totals per config

| config | calls | ok | retries | Σ cost USD | avg cost | min / max cost | avg in | avg cache w | avg cache r | avg out | avg s | max s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sonnet-low-nothink@anthropic | 2 | 2 | 0 | 0.0309 | 0.0154 | 0.0153 / 0.0156 | 6223 | 0 | 0 | 298 | 7.4 | 7.9 |

## Weight and ХЕ accuracy (photos with a known weight)

Estimate in grams (signed error %) · ХЕ from the model's portion. Truth ХЕ = grams × carbsPer100 / 100 / 12 when carbsPer100 is given.

| photo | truth | sonnet-low-nothink@anthropic |
|---|---|---|
| p01 | apple, whole, on the table · 314 г · 3.6 ХЕ | 315 г (+0%) · 2.8 ХЕ |
| p02 | banana in its peel, on a chopping board · 157 г · 3 ХЕ | 157 г (0%) · 2 ХЕ |
| **MAPE grams** |  | 0% |
| **mean signed grams error** |  | 0% |
| **mean abs ХЕ error** |  | 0.90 |
| **mean signed ХЕ error** |  | -0.90 |

## Per photo

### p01 — apple, whole, on the table · 314 г

File: `07087FFB-01D3-4567-92A4-5BBE3638427D.jpg`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sonnet-low-nothink@anthropic | яблоко зелёное |  | 47 / 0.3 / 0.2 / 11.8 | 315 284–347 (medium) | 284 g (0.9, сердцевина) · 452.86 ml × 0.87 × 0.8 | volume 453 ml × 0.87 (A) × 0.80 = 315 g; gates a,b,d pass, c borderline (height/volume high vs typical apple, likely slight overestimate); edible 0.90 → 284 g | 133 / 0.9 / 0.6 / 33.5 / 2.8 | 960×1280 | 6222 / 0 / 0 / 315 | 0.0156 | 7.9 | maxHeight ~8.5cm seems large for a single apple footprint of 10x8.8cm, may slightly overestimate volume; still within plausible range for a large apple |

### p02 — banana in its peel, on a chopping board · 157 г

File: `EAB8A480-0CF8-4055-BD4A-7B74C3E36A85.jpg`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sonnet-low-nothink@anthropic | Банан |  | 89 / 1.1 / 0.3 / 23 | 157 126–188 (medium) | 102 g (0.65, кожура) · 190.22 ml × 0.87 × 0.95 | volume 190 ml × 0.87 (B) × 0.95 = 157 g; gates a,c,d pass, b marginal (residual 1.7mm ok); edible 0.65 → 102 g | 91 / 1.1 / 0.3 / 23.5 / 2 | 960×1280 | 6224 / 0 / 0 / 281 | 0.0153 | 7.0 | Изогнутый банан, ширина маски отражает кривизну, а не толщину; толщина оценена по meanHeight |
