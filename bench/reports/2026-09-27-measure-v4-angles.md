# Measure stills at several angles, prompt v4, Agent SDK, thinking off — 2026-09-27

Eight new stills from 2026-09-26 (AirDrop originals, 4032 × 3024 HEIC, converted by the bench with `sips`; the server then normalizes to 1568 px): one green apple at 12°, 47° and 61° off vertical, a small red apple at 48°, one banana in three positions at 34–38°, a mandarin at 43°. The Measure records now carry `viewAngle`, `fill` and `meanWidth`. Truth from the kitchen scale in `truth.json` (the notes were free text: "320 top", "Apple, 127"…). Prompt v4: the model picks product / state / shape and checks the mask; the server multiplies; the model never sees the volume. Three models at effort low, thinking off, 24 calls over the Agent SDK.

## Picks and results

| still | model | name | product / state / shape | mask fits | visualGrams | server estimate | error | gates failed | cost USD | s |
|---|---|---|---|---|---|---|---|---|---|---|
| p03 green apple, from above (12°) · 320 g | haiku | зелёное яблоко | apple / whole / sphere | true | 170 | 318 (high) | -1 % | — | 0.007 | 9 |
| p03 green apple, from above (12°) · 320 g | sonnet | Зелёное яблоко | apple / whole / sphere | true | 180 | 318 (high) | -1 % | — | 0.013 | 6 |
| p03 green apple, from above (12°) · 320 g | opus | Яблоко зелёное | apple / whole / sphere | true | 180 | 318 (high) | -1 % | — | 0.202 | 10 |
| p08 green apple, 47° (note was empty) · 320 g | haiku | зелёное яблоко | apple / whole / sphere | true | 165 | 309 (medium) | -3 % | angle | 0.006 | 10 |
| p08 green apple, 47° (note was empty) · 320 g | sonnet | Зелёное яблоко | apple / whole / sphere | true | 150 | 309 (medium) | -3 % | angle | 0.013 | 5 |
| p08 green apple, 47° (note was empty) · 320 g | opus | Яблоко зелёное (Гренни Смит) | apple / whole / sphere | true | 190 | 309 (medium) | -3 % | angle | 0.203 | 12 |
| p07 green apple, low angle (61°) · 320 g | haiku | зелёное яблоко | apple / whole / sphere | true | 165 | 141 (medium) | -56 % | depth, angle | 0.006 | 9 |
| p07 green apple, low angle (61°) · 320 g | sonnet | Зелёное яблоко | apple / whole / sphere | true | 150 | 141 (medium) | -56 % | depth, angle | 0.013 | 5 |
| p07 green apple, low angle (61°) · 320 g | opus | Зелёное яблоко (Гренни Смит) | apple / whole / sphere | **false** | 190 | 190 (low) | -41 % | depth, angle, mask | 0.036 | 8 |
| p05 small red apple, 48° · 127 g | haiku | яблоко красное | apple / whole / sphere | true | 180 | 103 (medium) | -19 % | angle | 0.005 | 6 |
| p05 small red apple, 48° · 127 g | sonnet | Яблоко красное | apple / whole / sphere | **false** | 150 | 150 (low) | +18 % | angle, mask | 0.013 | 6 |
| p05 small red apple, 48° · 127 g | opus | яблоко красное | apple / whole / sphere | **false** | 150 | 150 (low) | +18 % | angle, mask | 0.035 | 8 |
| p06 banana in its peel, 38° · 141 g | haiku | банан жёлтый | banana / whole / cylinder | true | 120 | 158 (high) | +12 % | — | 0.007 | 10 |
| p06 banana in its peel, 38° · 141 g | sonnet | Банан | banana / whole / cylinder | true | 130 | 158 (high) | +12 % | — | 0.013 | 6 |
| p06 banana in its peel, 38° · 141 g | opus | банан | banana / whole / cylinder | true | 140 | 158 (high) | +12 % | — | 0.034 | 9 |
| p04 banana in its peel, reversed, 38° · 141 g | haiku | банан | banana / whole / cylinder | true | 110 | 141 (high) | +0 % | — | 0.006 | 8 |
| p04 banana in its peel, reversed, 38° · 141 g | sonnet | Банан | banana / whole / cylinder | true | 120 | 141 (high) | +0 % | — | 0.013 | 5 |
| p04 banana in its peel, reversed, 38° · 141 g | opus | банан | banana / whole / cylinder | true | 130 | 141 (high) | +0 % | — | 0.032 | 7 |
| p01 banana in its peel, 'picant', 34° · 141 g | haiku | банан жёлтый | banana / whole / cylinder | true | 120 | 121 (high) | -14 % | — | 0.007 | 11 |
| p01 banana in its peel, 'picant', 34° · 141 g | sonnet | Банан | banana / whole / cylinder | true | 130 | 121 (high) | -14 % | — | 0.013 | 8 |
| p01 banana in its peel, 'picant', 34° · 141 g | opus | банан | banana / whole / cylinder | true | 140 | 121 (high) | -14 % | — | 0.205 | 13 |
| p02 mandarin, 43° · 68 g | haiku | лимон жёлтый | other / whole / sphere | true | 110 | null (low) | n/a | product | 0.007 | 9 |
| p02 mandarin, 43° · 68 g | sonnet | Мандарин | mandarin / whole / sphere | true | 55 | 68 (high) | +0 % | — | 0.013 | 5 |
| p02 mandarin, 43° · 68 g | opus | мандарин | mandarin / whole / sphere | **false** | 85 | 85 (low) | +25 % | mask | 0.033 | 7 |

MAPE of the geometry answers (mask and product gates passed): haiku 15 % over 7 geometry answers; sonnet 12 % over 7 geometry answers; opus 6 % over 5 geometry answers. The 61° still is inside those numbers; without it the geometry is within ±19 % everywhere and within 3 % on the big apple and the mandarin.

## What the stills say

- **The sphere factor holds to 48°.** The 320 g apple: 318 g from above, 309 g at 47°. The mandarin: 68 g on the nose with the table's uncalibrated 0.95 density. 0.87 looks like the class's number, not one apple's.
- **61° breaks the measurement, and the gates under-react.** The LiDAR loses the far side: footprint halves (29.6 cm² against 64), depth coverage 0.79, volume 202 ml against 456. The server computes 141 g and calls it *medium* because two soft gates failed; the answer is −56 %. `depth` below 0.9, or `angle` above 60°, should make the answer *low* or hand over to the visual guess — a server rule, not a prompt change.
- **The banana moves ±13 % with how it lies**: 158 / 141 / 121 g for 141 g in three positions, the mean exact. A curved item hides a different amount of air depending on which side of the arc it rests on; 0.87 stays until there are more bananas.
- **The small red apple is the mask's fault, not the angle's.** Footprint 12.4 × 7.6 cm with a mean width of 2.5 cm around a ~6.5 cm apple: the shadow to the lower left is in the mask. Haiku passed the mask and got 103 g (−19 %); Opus and Sonnet failed it and fell back to 150 g (+18 %). Both readings are honest; the fix is upstream, in Plate's mask or the lighting.
- **The mask gate, per model:** Haiku never fails it (8/8), Sonnet once (the small apple, rightly), Opus three times (the small apple rightly; the mandarin and the 61° apple on the "mean width inconsistent with a round footprint" argument — on a round footprint the mean width is about 0.7 × the width by geometry alone). Opus's flips cost it the mandarin (85 g visual against 68) and would have cost the 47° apple in yesterday's run.
- **Haiku called the mandarin a lemon** → `product: other` → no grams (the visual guess was 110 g for 68). The photo is a small yellow-orange fruit on a grey table; the `hint` field or a product picked by the user in the app closes this.
- **The visual prior is "medium-sized"**: 150–190 g for a 320 g apple, 150–180 g for a 127 g one, 110–140 g for the 141 g banana, 55–110 g for the 68 g mandarin. Large items under, small items over. The sensor beats it on every still but the 61° one.

## Model notes

- **p03 green apple, from above (12°), opus:** Mean width 6.5 cm is much less than the 9.9 cm footprint, typical of a rounded mask edge; shadow to the right may slightly widen it, but the outline matches the apple.
- **p08 green apple, 47° (note was empty), opus:** Fill 0.88 fits a sphere; mean width 6.0 cm is low for a 10 cm round footprint, hinting the mask tapers (shadow on the right side of the apple).
- **p07 green apple, low angle (61°), haiku:** Green apple, likely Granny Smith variety, in good condition with glossy skin. Measurements consistent with a whole spherical apple.
- **p07 green apple, low angle (61°), sonnet:** Footprint length (9.7cm) larger than mean width suggests slight elongation or a bit of shadow inclusion, but overall matches the apple's own outline well.
- **p07 green apple, low angle (61°), opus:** Яблоко на фото круглое, диаметр ≈ высоте (8 см), но маска даёт 9.7×6.4 см при средней ширине 3.1 см — вытянутая узкая область, вероятно захвачена тень справа/текстура стола. Fill 0.83 согласуется со сферой.
- **p05 small red apple, 48°, haiku:** Red apple with some yellow-green on the shoulder; classic spherical shape; footprint ratio and fill value (0.84) confirm sphere; the outline in the photo matches the footprint dimensions well with no contamination from plate edges or shadows.
- **p05 small red apple, 48°, sonnet:** Footprint length 12.4 cm far exceeds a single apple's diameter (~7-8 cm) and mean width 2.5 cm is inconsistent with the item's visible size; footprint likely includes shadow or table area beyond the apple.
- **p05 small red apple, 48°, opus:** Мask elongated (12.4 × 7.6 cm) with a very small mean width (2.5 cm) — inconsistent with the round apple outline; likely includes the shadow on the table. Height 5.8 cm and fill 0.84 fit the apple itself.
- **p06 banana in its peel, 38°, haiku:** Small brown spot on skin; stem visible. Good lighting and clear outline.
- **p06 banana in its peel, 38°, sonnet:** Curved banana; footprint width includes the curve, consistent with mean width vs height.
- **p06 banana in its peel, 38°, opus:** Curved fruit: bounding width (12.2 cm) covers the arc, not the thickness; mean width 4.3 cm is consistent with height 3.2 cm. Weight includes peel (~65% edible).
- **p04 banana in its peel, reversed, 38°, opus:** Footprint width 10.9 cm spans the curve; mean width 3.7 cm matches the fruit's thickness, so the mask is the banana itself.
- **p01 banana in its peel, 'picant', 34°, haiku:** Ripe banana with minor spots on skin; clean LiDAR measurement
- **p01 banana in its peel, 'picant', 34°, opus:** Footprint width 11.8 cm spans the curve; mean width 3.9 cm matches the fruit's thickness, so the mask is the banana itself. Stem included.
- **p02 mandarin, 43°, haiku:** Standard yellow lemon, whole fruit with calyx visible at top. Measurements and visual appearance fully consistent with a medium lemon.
- **p02 mandarin, 43°, opus:** Footprint 7.8×6.2 cm is larger than the round fruit's outline (~6 cm) and the mean width 3.8 cm is inconsistent with a near-circular shape — mask likely includes the shadow to the right.

---

## `bench/summarize.mjs` output

# Photo benchmark — 2026-09-26

Calls: 24 (24 ok). Photos: 8. Configs: opus-low-nothink, sonnet-low-nothink, haiku-low-nothink.

per 100 g as the model reported it; portion = per 100 g × estimated grams (server-side; for a measured still, × the edible grams); tokens: in = uncached input, cache w/r = prompt-cache write/read, out = output; cost = the server estimate (`stats.cost`); ⟲ = the call needed a second turn (structured-output retry). Stills sent with a Measure JSON (`/portion/photo`) also show low–high, the edible part and the geometry the model used.

## Totals per config

| config | calls | ok | retries | Σ cost USD | avg cost | min / max cost | avg in | avg cache w | avg cache r | avg out | avg s | max s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | 8 | 8 | 3 | 0.7799 | 0.0975 | 0.0325 / 0.2046 | 17274 | 0 | 0 | 445 | 9.1 | 12.9 |
| sonnet-low-nothink | 8 | 8 | 0 | 0.1028 | 0.0129 | 0.0126 / 0.0134 | 5046 | 0 | 0 | 276 | 5.8 | 7.7 |
| haiku-low-nothink | 8 | 8 | 0 | 0.0514 | 0.0064 | 0.0052 / 0.0069 | 3864 | 0 | 0 | 511 | 8.9 | 10.6 |

## Weight and ХЕ accuracy (photos with a known weight)

Estimate in grams (signed error %) · ХЕ from the model's portion. Truth ХЕ = grams × carbsPer100 / 100 / 12 when carbsPer100 is given.

| photo | truth | opus-low-nothink | sonnet-low-nothink | haiku-low-nothink |
|---|---|---|---|---|
| p01 | banana in its peel, 'picant', 34° · 141 г · 2.7 ХЕ | 121 г (-14%) · 1.5 ХЕ | 121 г (-14%) · 1.5 ХЕ | 121 г (-14%) · 1.5 ХЕ |
| p02 | mandarin, 43° · 68 г · 0.8 ХЕ | 85 г (+25%) · 0.7 ХЕ | 68 г (0%) · 0.5 ХЕ | null |
| p03 | green apple, from above (12°) · 320 г · 3.7 ХЕ | 318 г (-1%) · 3.3 ХЕ | 318 г (-1%) · 3.3 ХЕ | 318 г (-1%) · 3.3 ХЕ |
| p04 | banana in its peel, reversed, 38° · 141 г · 2.7 ХЕ | 141 г (0%) · 1.8 ХЕ | 141 г (0%) · 1.8 ХЕ | 141 г (0%) · 1.8 ХЕ |
| p05 | small red apple, 48° · 127 г · 1.5 ХЕ | 150 г (+18%) · 1.6 ХЕ | 150 г (+18%) · 1.6 ХЕ | 103 г (-19%) · 1.1 ХЕ |
| p06 | banana in its peel, 38° · 141 г · 2.7 ХЕ | 158 г (+12%) · 2 ХЕ | 158 г (+12%) · 2 ХЕ | 158 г (+12%) · 2 ХЕ |
| p07 | green apple, low angle (61°) · 320 г · 3.7 ХЕ | 190 г (-41%) · 2 ХЕ | 141 г (-56%) · 1.5 ХЕ | 141 г (-56%) · 1.5 ХЕ |
| p08 | green apple, 47° (note was empty) · 320 г · 3.7 ХЕ | 309 г (-3%) · 3.2 ХЕ | 309 г (-3%) · 3.2 ХЕ | 309 г (-3%) · 3.2 ХЕ |
| **MAPE grams** |  | 14% | 13% | 15% |
| **mean signed grams error** |  | 0% | -6% | -12% |
| **mean abs ХЕ error** |  | 0.70 | 0.79 | 0.90 |
| **mean signed ХЕ error** |  | -0.68 | -0.76 | -0.90 |

## Per photo

### p01 — banana in its peel, 'picant', 34° · 141 г

File: `0955D738-CD85-497D-8067-FC8014C6D0FA.heic`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | банан | table | 89 / 1.1 / 0.3 / 22.8 | 121 109–133 (high) | 79 g (0.65, peel) · 146.4 ml × 0.87 × 0.95 | volume 146 ml × 0.87 (cylinder) × 0.95 (banana) = 121 g; gates pass; edible 0.65 (peel) → 79 g | 70 / 0.9 / 0.2 / 18 / 1.5 | 1176×1568 | 37762 / 0 / 0 / 630 | 0.2046 ⟲ | 12.9 | Footprint width 11.8 cm spans the curve; mean width 3.9 cm matches the fruit's thickness, so the mask is the banana itself. Stem included. |
| sonnet-low-nothink | Банан | table | 89 / 1.1 / 0.3 / 22.8 | 121 109–133 (high) | 79 g (0.65, peel) · 146.4 ml × 0.87 × 0.95 | volume 146 ml × 0.87 (cylinder) × 0.95 (banana) = 121 g; gates pass; edible 0.65 (peel) → 79 g | 70 / 0.9 / 0.2 / 18 / 1.5 | 1176×1568 | 5046 / 0 / 0 / 253 | 0.0126 | 7.7 |  |
| haiku-low-nothink | банан жёлтый | table | 89 / 1.1 / 0.3 / 22.8 | 121 109–133 (high) | 79 g (0.65, peel) · 146.4 ml × 0.87 × 0.95 | volume 146 ml × 0.87 (cylinder) × 0.95 (banana) = 121 g; gates pass; edible 0.65 (peel) → 79 g | 70 / 0.9 / 0.2 / 18 / 1.5 | 1176×1568 | 3864 / 0 / 0 / 530 | 0.0065 | 10.6 | Ripe banana with minor spots on skin; clean LiDAR measurement |

### p02 — mandarin, 43° · 68 г

File: `103C4C88-C594-4CBD-AAC7-86B07FB7A020.heic`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | мандарин | table | 53 / 0.8 / 0.3 / 13.3 | 85 55–115 (low) | 61 g (0.72, peel) | the mask does not fit the item (model); visual estimate 85 g | 32 / 0.5 / 0.2 / 8.1 / 0.7 | 1176×1568 | 4978 / 0 / 0 / 329 | 0.0331 | 7.0 | Footprint 7.8×6.2 cm is larger than the round fruit's outline (~6 cm) and the mean width 3.8 cm is inconsistent with a near-circular shape — mask likely includes the shadow to the right. |
| sonnet-low-nothink | Мандарин | table | 53 / 0.8 / 0.3 / 13.3 | 68 61–75 (high) | 49 g (0.72, peel) · 81.9 ml × 0.87 × 0.95 | volume 82 ml × 0.87 (sphere) × 0.95 (mandarin) = 68 g; gates pass; edible 0.72 (peel) → 49 g | 26 / 0.4 / 0.1 / 6.5 / 0.5 | 1176×1568 | 5046 / 0 / 0 / 258 | 0.0127 | 5.4 |  |
| haiku-low-nothink | лимон жёлтый | knowledge | 29 / 1.1 / 0.3 / 9.3 | — (low) | whole | "лимон жёлтый" is not in the product table: no density, no grams | — | 1176×1568 | 3864 / 0 / 0 / 603 | 0.0069 | 9.3 | Standard yellow lemon, whole fruit with calyx visible at top. Measurements and visual appearance fully consistent with a medium lemon. |

### p03 — green apple, from above (12°) · 320 г

File: `4B8EAAB8-ED41-4462-8F53-7D606C0F9D9C.heic`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | Яблоко зелёное | table | 52 / 0.3 / 0.2 / 13.8 | 318 286–350 (high) | 286 g (0.9, core) · 456.4 ml × 0.87 × 0.8 | volume 456 ml × 0.87 (sphere) × 0.8 (apple) = 318 g; gates pass; edible 0.9 (core) → 286 g | 149 / 0.9 / 0.6 / 39.5 / 3.3 | 1176×1568 | 37752 / 0 / 0 / 526 | 0.2019 ⟲ | 9.8 | Mean width 6.5 cm is much less than the 9.9 cm footprint, typical of a rounded mask edge; shadow to the right may slightly widen it, but the outline matches the apple. |
| sonnet-low-nothink | Зелёное яблоко | table | 52 / 0.3 / 0.2 / 13.8 | 318 286–350 (high) | 286 g (0.9, core) · 456.4 ml × 0.87 × 0.8 | volume 456 ml × 0.87 (sphere) × 0.8 (apple) = 318 g; gates pass; edible 0.9 (core) → 286 g | 149 / 0.9 / 0.6 / 39.5 / 3.3 | 1176×1568 | 5046 / 0 / 0 / 258 | 0.0127 | 6.1 |  |
| haiku-low-nothink | зелёное яблоко | table | 52 / 0.3 / 0.2 / 13.8 | 318 286–350 (high) | 286 g (0.9, core) · 456.4 ml × 0.87 × 0.8 | volume 456 ml × 0.87 (sphere) × 0.8 (apple) = 318 g; gates pass; edible 0.9 (core) → 286 g | 149 / 0.9 / 0.6 / 39.5 / 3.3 | 1176×1568 | 3864 / 0 / 0 / 565 | 0.0067 | 8.8 |  |

### p04 — banana in its peel, reversed, 38° · 141 г

File: `5FA48436-FFAE-4806-8F37-F9A3D23D55C0.heic`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | банан | table | 89 / 1.1 / 0.3 / 22.8 | 141 127–155 (high) | 92 g (0.65, peel) · 171 ml × 0.87 × 0.95 | volume 171 ml × 0.87 (cylinder) × 0.95 (banana) = 141 g; gates pass; edible 0.65 (peel) → 92 g | 82 / 1 / 0.3 / 21 / 1.8 | 1176×1568 | 4978 / 0 / 0 / 303 | 0.0325 | 6.6 | Footprint width 10.9 cm spans the curve; mean width 3.7 cm matches the fruit's thickness, so the mask is the banana itself. |
| sonnet-low-nothink | Банан | table | 89 / 1.1 / 0.3 / 22.8 | 141 127–155 (high) | 92 g (0.65, peel) · 171 ml × 0.87 × 0.95 | volume 171 ml × 0.87 (cylinder) × 0.95 (banana) = 141 g; gates pass; edible 0.65 (peel) → 92 g | 82 / 1 / 0.3 / 21 / 1.8 | 1176×1568 | 5046 / 0 / 0 / 253 | 0.0126 | 5.2 |  |
| haiku-low-nothink | банан | table | 89 / 1.1 / 0.3 / 22.8 | 141 127–155 (high) | 92 g (0.65, peel) · 171 ml × 0.87 × 0.95 | volume 171 ml × 0.87 (cylinder) × 0.95 (banana) = 141 g; gates pass; edible 0.65 (peel) → 92 g | 82 / 1 / 0.3 / 21 / 1.8 | 1176×1568 | 3864 / 0 / 0 / 488 | 0.0063 | 7.9 |  |

### p05 — small red apple, 48° · 127 г

File: `766D1C23-CB37-4780-9E97-8A1AA5522082.heic`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | яблоко красное | table | 52 / 0.3 / 0.2 / 13.8 | 150 98–203 (low) | 135 g (0.9, core) | the mask does not fit the item (model); visual estimate 150 g | 70 / 0.4 / 0.3 / 18.6 / 1.6 | 1176×1568 | 4978 / 0 / 0 / 404 | 0.0350 | 7.7 | Мask elongated (12.4 × 7.6 cm) with a very small mean width (2.5 cm) — inconsistent with the round apple outline; likely includes the shadow on the table. Height 5.8 cm and fill 0.84 fit the apple itself. |
| sonnet-low-nothink | Яблоко красное | table | 52 / 0.3 / 0.2 / 13.8 | 150 98–203 (low) | 135 g (0.9, core) | the mask does not fit the item (model); visual estimate 150 g | 70 / 0.4 / 0.3 / 18.6 / 1.6 | 1176×1568 | 5046 / 0 / 0 / 334 | 0.0134 | 5.7 | Footprint length 12.4 cm far exceeds a single apple's diameter (~7-8 cm) and mean width 2.5 cm is inconsistent with the item's visible size; footprint likely includes shadow or table area beyond the apple. |
| haiku-low-nothink | яблоко красное | table | 52 / 0.3 / 0.2 / 13.8 | 103 82–124 (medium) | 93 g (0.9, core) · 148.2 ml × 0.87 × 0.8 | volume 148 ml × 0.87 (sphere) × 0.8 (apple) = 103 g; view angle 48° over 45; edible 0.9 (core) → 93 g | 48 / 0.3 / 0.2 / 12.8 / 1.1 | 1176×1568 | 3864 / 0 / 0 / 276 | 0.0052 | 5.6 | Red apple with some yellow-green on the shoulder; classic spherical shape; footprint ratio and fill value (0.84) confirm sphere; the outline in the photo matches the footprint dimensions well with no contamination from plate edges or shadows. |

### p06 — banana in its peel, 38° · 141 г

File: `D0383BB4-5CC9-4A38-BA00-73F562ED67DC.heic`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | банан | table | 89 / 1.1 / 0.3 / 22.8 | 158 142–174 (high) | 103 g (0.65, peel) · 191.6 ml × 0.87 × 0.95 | volume 192 ml × 0.87 (cylinder) × 0.95 (banana) = 158 g; gates pass; edible 0.65 (peel) → 103 g | 92 / 1.1 / 0.3 / 23.5 / 2 | 1176×1568 | 4978 / 0 / 0 / 371 | 0.0342 | 8.6 | Curved fruit: bounding width (12.2 cm) covers the arc, not the thickness; mean width 4.3 cm is consistent with height 3.2 cm. Weight includes peel (~65% edible). |
| sonnet-low-nothink | Банан | table | 89 / 1.1 / 0.3 / 22.8 | 158 142–174 (high) | 103 g (0.65, peel) · 191.6 ml × 0.87 × 0.95 | volume 192 ml × 0.87 (cylinder) × 0.95 (banana) = 158 g; gates pass; edible 0.65 (peel) → 103 g | 92 / 1.1 / 0.3 / 23.5 / 2 | 1176×1568 | 5046 / 0 / 0 / 281 | 0.0129 | 5.8 | Curved banana; footprint width includes the curve, consistent with mean width vs height. |
| haiku-low-nothink | банан жёлтый | table | 89 / 1.1 / 0.3 / 22.8 | 158 142–174 (high) | 103 g (0.65, peel) · 191.6 ml × 0.87 × 0.95 | volume 192 ml × 0.87 (cylinder) × 0.95 (banana) = 158 g; gates pass; edible 0.65 (peel) → 103 g | 92 / 1.1 / 0.3 / 23.5 / 2 | 1176×1568 | 3864 / 0 / 0 / 594 | 0.0068 | 9.6 | Small brown spot on skin; stem visible. Good lighting and clear outline. |

### p07 — green apple, low angle (61°) · 320 г

File: `D217DCFF-01F2-4D42-BC40-1D56025C6D98.heic`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | Зелёное яблоко (Гренни Смит) | table | 52 / 0.3 / 0.2 / 13.8 | 190 124–257 (low) | 171 g (0.9, core) | the mask does not fit the item (model); visual estimate 190 g | 89 / 0.5 / 0.3 / 23.6 / 2 | 1176×1568 | 4978 / 0 / 0 / 429 | 0.0356 | 8.0 | Яблоко на фото круглое, диаметр ≈ высоте (8 см), но маска даёт 9.7×6.4 см при средней ширине 3.1 см — вытянутая узкая область, вероятно захвачена тень справа/текстура стола. Fill 0.83 согласуется со сферой. |
| sonnet-low-nothink | Зелёное яблоко | table | 52 / 0.3 / 0.2 / 13.8 | 141 113–169 (medium) | 127 g (0.9, core) · 202 ml × 0.87 × 0.8 | volume 202 ml × 0.87 (sphere) × 0.8 (apple) = 141 g; depth on 79 % of the mask, the volume is a lower bound, view angle 61° over 45; edible 0.9 (core) → 127 g | 66 / 0.4 / 0.3 / 17.5 / 1.5 | 1176×1568 | 5046 / 0 / 0 / 312 | 0.0132 | 5.4 | Footprint length (9.7cm) larger than mean width suggests slight elongation or a bit of shadow inclusion, but overall matches the apple's own outline well. |
| haiku-low-nothink | зелёное яблоко | table | 52 / 0.3 / 0.2 / 13.8 | 141 113–169 (medium) | 127 g (0.9, core) · 202 ml × 0.87 × 0.8 | volume 202 ml × 0.87 (sphere) × 0.8 (apple) = 141 g; depth on 79 % of the mask, the volume is a lower bound, view angle 61° over 45; edible 0.9 (core) → 127 g | 66 / 0.4 / 0.3 / 17.5 / 1.5 | 1176×1568 | 3864 / 0 / 0 / 521 | 0.0065 | 8.8 | Green apple, likely Granny Smith variety, in good condition with glossy skin. Measurements consistent with a whole spherical apple. |

### p08 — green apple, 47° (note was empty) · 320 г

File: `EF99B000-ED0B-4F92-BFB6-D9C51E5B1F1E.heic`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | Яблоко зелёное (Гренни Смит) | table | 52 / 0.3 / 0.2 / 13.8 | 309 247–371 (medium) | 278 g (0.9, core) · 443.6 ml × 0.87 × 0.8 | volume 444 ml × 0.87 (sphere) × 0.8 (apple) = 309 g; view angle 47° over 45; edible 0.9 (core) → 278 g | 145 / 0.8 / 0.6 / 38.4 / 3.2 | 1176×1568 | 37784 / 0 / 0 / 565 | 0.2030 ⟲ | 11.9 | Fill 0.88 fits a sphere; mean width 6.0 cm is low for a 10 cm round footprint, hinting the mask tapers (shadow on the right side of the apple). |
| sonnet-low-nothink | Зелёное яблоко | table | 52 / 0.3 / 0.2 / 13.8 | 309 247–371 (medium) | 278 g (0.9, core) · 443.6 ml × 0.87 × 0.8 | volume 444 ml × 0.87 (sphere) × 0.8 (apple) = 309 g; view angle 47° over 45; edible 0.9 (core) → 278 g | 145 / 0.8 / 0.6 / 38.4 / 3.2 | 1176×1568 | 5046 / 0 / 0 / 260 | 0.0127 | 5.5 |  |
| haiku-low-nothink | зелёное яблоко | table | 52 / 0.3 / 0.2 / 13.8 | 309 247–371 (medium) | 278 g (0.9, core) · 443.6 ml × 0.87 × 0.8 | volume 444 ml × 0.87 (sphere) × 0.8 (apple) = 309 g; view angle 47° over 45; edible 0.9 (core) → 278 g | 145 / 0.8 / 0.6 / 38.4 / 3.2 | 1176×1568 | 3864 / 0 / 0 / 511 | 0.0064 | 10.3 |  |
