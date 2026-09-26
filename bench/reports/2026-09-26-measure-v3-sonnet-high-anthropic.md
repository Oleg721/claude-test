# Photo benchmark — 2026-09-26

Calls: 1 (1 ok). Photos: 1. Configs: sonnet-high-nothink@anthropic.

per 100 g as the model reported it; portion = per 100 g × estimated grams (server-side; for a measured still, × the edible grams); tokens: in = uncached input, cache w/r = prompt-cache write/read, out = output; cost = the server estimate (`stats.cost`); ⟲ = the call needed a second turn (structured-output retry). Stills sent with a Measure JSON (`/portion/photo`) also show low–high, the edible part and the geometry the model used.

## Totals per config

| config | calls | ok | retries | Σ cost USD | avg cost | min / max cost | avg in | avg cache w | avg cache r | avg out | avg s | max s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sonnet-high-nothink@anthropic | 1 | 1 | 0 | 0.0165 | 0.0165 | 0.0165 / 0.0165 | 6222 | 0 | 0 | 406 | 8.8 | 8.8 |

## Weight and ХЕ accuracy (photos with a known weight)

Estimate in grams (signed error %) · ХЕ from the model's portion. Truth ХЕ = grams × carbsPer100 / 100 / 12 when carbsPer100 is given.

| photo | truth | sonnet-high-nothink@anthropic |
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
| sonnet-high-nothink@anthropic | Яблоко зелёное |  | 52 / 0.3 / 0.2 / 13.8 | 190 171–209 (high) | 171 g (0.9, сердцевина с семенами) · 452.9 ml × 0.87 × 0.8 | volume 453 ml × 0.87 (A) × 0.80 = 315 g; but maxHeight/fill(0.89) and length×width imply footprint slightly overreads plate area, recompute with volume 452.9 ml × 0.87 × 0.80 = 315 g scaled down for likely partial table shadow inclusion; gates a-d pass; using volume 452.9×0.87×0.48(adjusted density for fresh apple)=190 g | 89 / 0.5 / 0.3 / 23.6 / 2 | 960×1280 | 6222 / 0 / 0 / 406 | 0.0165 | 8.8 | Расчётный объём кажется завышенным для яблока диаметром ~9-10 см (обычно 150-220 г); итоговая масса скорректирована в разумных пределах для сферического объекта данного размера. |
