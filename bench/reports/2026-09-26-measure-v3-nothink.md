# Photo benchmark — 2026-09-25

Calls: 6 (6 ok). Photos: 2. Configs: opus-low-nothink, sonnet-low-nothink, haiku-low-nothink.

per 100 g as the model reported it; portion = per 100 g × estimated grams (server-side; for a measured still, × the edible grams); tokens: in = uncached input, cache w/r = prompt-cache write/read, out = output; cost = the server estimate (`stats.cost`); ⟲ = the call needed a second turn (structured-output retry). Stills sent with a Measure JSON (`/portion/photo`) also show low–high, the edible part and the geometry the model used.

## Totals per config

| config | calls | ok | retries | Σ cost USD | avg cost | min / max cost | avg in | avg cache w | avg cache r | avg out | avg s | max s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | 2 | 2 | 0 | 0.0822 | 0.0411 | 0.0406 / 0.0416 | 6671 | 0 | 0 | 310 | 6.8 | 7.2 |
| sonnet-low-nothink | 2 | 2 | 2 | 0.1803 | 0.0902 | 0.0892 / 0.0911 | 41335 | 0 | 0 | 750 | 8.5 | 8.6 |
| haiku-low-nothink | 2 | 2 | 0 | 0.0197 | 0.0099 | 0.0099 / 0.0099 | 5836 | 0 | 0 | 805 | 11.1 | 11.5 |

## Weight and ХЕ accuracy (photos with a known weight)

Estimate in grams (signed error %) · ХЕ from the model's portion. Truth ХЕ = grams × carbsPer100 / 100 / 12 when carbsPer100 is given.

| photo | truth | opus-low-nothink | sonnet-low-nothink | haiku-low-nothink |
|---|---|---|---|---|
| p01 | apple, whole, on the table · 314 г · 3.6 ХЕ | 315 г (+0%) · 3.3 ХЕ | 315 г (+0%) · 3.3 ХЕ | 315.4 г (+0%) · 3.3 ХЕ |
| p02 | banana in its peel, on a chopping board · 157 г · 3 ХЕ | 157 г (0%) · 1.9 ХЕ | 157 г (0%) · 1.9 ХЕ | 157 г (0%) · 2 ХЕ |
| **MAPE grams** |  | 0% | 0% | 0% |
| **mean signed grams error** |  | 0% | 0% | 0% |
| **mean abs ХЕ error** |  | 0.70 | 0.70 | 0.65 |
| **mean signed ХЕ error** |  | -0.70 | -0.70 | -0.65 |

## Per photo

### p01 — apple, whole, on the table · 314 г

File: `07087FFB-01D3-4567-92A4-5BBE3638427D.jpg`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | Яблоко зелёное |  | 52 / 0.3 / 0.2 / 14 | 315 284–347 (high) | 284 g (0.9, сердцевина) · 452.9 ml × 0.87 × 0.8 | volume 453 ml × 0.87 (A) × 0.80 = 315 g; gates a–d pass; edible 0.90 → 284 g | 148 / 0.9 / 0.6 / 39.8 / 3.3 | 960×1280 | 6670 / 0 / 0 / 331 | 0.0416 | 6.3 | Крупное яблоко; футпринт 10.2×8.8 см согласуется с фото. |
| sonnet-low-nothink | Яблоко зелёное |  | 52 / 0.3 / 0.2 / 14 | 315 284–347 (high) | 284 g (0.9, сердцевина) · 452.8628437163023 ml × 0.87 × 0.8 | volume 452.9 ml × 0.87 (A) × 0.80 = 315 g; gates a-d pass | 148 / 0.9 / 0.6 / 39.8 / 3.3 | 960×1280 | 41270 / 0 / 0 / 669 | 0.0892 ⟲ | 8.5 |  |
| haiku-low-nothink | зелёное яблоко |  | 52 / 0.26 / 0.17 / 13.8 | 315.4 283.9–346.9 (high) | 283.9 g (0.9, core) · 452.86 ml × 0.87 × 0.8 | volume 452.86 ml × 0.87 (A) × 0.80 = 315.4 g; gates a–d pass; edible 0.90 → 283.9 g | 148 / 0.7 / 0.5 / 39.2 / 3.3 | 960×1280 | 5835 / 0 / 0 / 807 | 0.0099 | 11.5 |  |

### p02 — banana in its peel, on a chopping board · 157 г

File: `EAB8A480-0CF8-4055-BD4A-7B74C3E36A85.jpg`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | Банан |  | 89 / 1.1 / 0.3 / 22.8 | 157 141–173 (high) | 102 g (0.65, кожура) · 190.2 ml × 0.87 × 0.95 | volume 190 ml × 0.87 (B) × 0.95 = 157 g; gates a–d pass; edible 0.65 → 102 g | 91 / 1.1 / 0.3 / 23.3 / 1.9 | 960×1280 | 6672 / 0 / 0 / 288 | 0.0406 | 7.2 |  |
| sonnet-low-nothink | Банан |  | 95 / 1.1 / 0.3 / 21.8 | 157 141–173 (high) | 102 g (0.65, кожура) · 190.22 ml × 0.87 × 0.95 | volume 190.2 ml × 0.87 (B) × 0.95 = 157 g; gates a–d pass; edible 0.65 → 102 г | 97 / 1.1 / 0.3 / 22.2 / 1.9 | 960×1280 | 41399 / 0 / 0 / 831 | 0.0911 ⟲ | 8.6 |  |
| haiku-low-nothink | банан |  | 89 / 1.1 / 0.3 / 23 | 157 142–173 (high) | 102 g (0.65, кожура) · 190 ml × 0.87 × 0.95 | volume 190 ml × 0.87 (B) × 0.95 = 157 g; gates a–d pass; edible 0.65 → 102 g | 91 / 1.1 / 0.3 / 23.5 / 2 | 960×1280 | 5837 / 0 / 0 / 803 | 0.0099 | 10.7 |  |
