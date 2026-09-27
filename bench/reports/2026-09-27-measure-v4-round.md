# Measure v4 — six round stills, the sphere factor at 0.94 (2026-09-27)

Six new stills from 2026-09-27 evening (AirDrop originals, HEIC with the depth map, converted by the bench with `sips`): an apple of 242 g and an apple of 113 g, each at ~42° and from above (7°), and a mandarin of 49 g at 41° and from above (11°). Truth from the kitchen scale in `truth.json`. The server's sphere factor is 0.94 since this evening (from 0.87), set on ten round stills replayed offline in `plate/tools/measure-replay`; the run is the first with it. Prompt v4 unchanged: the model picks product / state / shape and checks the mask, the server multiplies. Three models at effort low, thinking off, 18 calls over the Agent SDK.

What it shows: wherever the model picks the right row and leaves the mask gate alone the geometry lands within 12 % on all six stills (apple 242 g: 0 % at 43°, −6 % from above; apple 113 g: +12 % / −4 %; mandarin: −4 % / −4 %). Every large miss is a model decision. Opus set `maskFitsItem` false on all three ~42° stills and Sonnet on two of them, and every flip is wrong — the replay tool shows the masks clean; the models read the footprint's length (13.0 × 9.5 cm around an 8 cm apple, mean width 4.9) as a shadow, when it is the far-side spur of the depth at that angle, a sensor artefact the factor already carries — so both fell back to visual guesses of 150 g for the 242 g apple (−38 %). Haiku never flips the gate and has the best grams (MAPE 4 %), but named the 49 g mandarin a yellow plum at 41° (49 g at the plum's density, right by accident) and a yellow mango from above (`other`, no grams), after the lemon of the day before; Opus called the 242 g apple from the stem end a pear (271 g at 0.95, +12 %). Cost per call: Haiku $0.0066, Sonnet $0.013 (one structured-output retry at $0.08), Opus $0.035 (two retries at $0.20).

# Photo benchmark — 2026-09-27

Calls: 18 (18 ok). Photos: 6. Configs: opus-low-nothink, sonnet-low-nothink, haiku-low-nothink.

per 100 g as the model reported it; portion = per 100 g × estimated grams (server-side; for a measured still, × the edible grams); tokens: in = uncached input, cache w/r = prompt-cache write/read, out = output; cost = the server estimate (`stats.cost`); ⟲ = the call needed a second turn (structured-output retry). Stills sent with a Measure JSON (`/portion/photo`) also show low–high, the edible part and the geometry the model used.

## Totals per config

| config | calls | ok | retries | Σ cost USD | avg cost | min / max cost | avg in | avg cache w | avg cache r | avg out | avg s | max s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | 6 | 6 | 2 | 0.5495 | 0.0916 | 0.0345 / 0.2084 | 15923 | 0 | 0 | 479 | 9.3 | 13.7 |
| sonnet-low-nothink | 6 | 6 | 1 | 0.1452 | 0.0242 | 0.0127 / 0.0798 | 10510 | 0 | 0 | 318 | 6.3 | 9.2 |
| haiku-low-nothink | 6 | 6 | 0 | 0.0397 | 0.0066 | 0.0063 / 0.0068 | 3864 | 0 | 0 | 552 | 9.1 | 11.5 |

## Weight and ХЕ accuracy (photos with a known weight)

Estimate in grams (signed error %) · ХЕ from the model's portion. Truth ХЕ = grams × carbsPer100 / 100 / 12 when carbsPer100 is given.

| photo | truth | opus-low-nothink | sonnet-low-nothink | haiku-low-nothink |
|---|---|---|---|---|
| p01 | mandarin 49 g, 41° · 49 г · 0.5 ХЕ | 75 г (+53%) · 0.6 ХЕ | 47 г (-4%) · 0.4 ХЕ | 49 г (0%) · 0.4 ХЕ |
| p02 | apple 242 g, 43° · 242 г · 2.8 ХЕ | 150 г (-38%) · 1.6 ХЕ | 150 г (-38%) · 1.6 ХЕ | 242 г (0%) · 2.5 ХЕ |
| p03 | apple 113 g, 40° · 113 г · 1.3 ХЕ | 150 г (+33%) · 1.6 ХЕ | 130 г (+15%) · 1.3 ХЕ | 127 г (+12%) · 1.3 ХЕ |
| p04 | apple 242 g, from above (7°) · 242 г · 2.8 ХЕ | 271 г (+12%) · 3.1 ХЕ | 228 г (-6%) · 2.4 ХЕ | 228 г (-6%) · 2.4 ХЕ |
| p05 | apple 113 g, from above (7°) · 113 г · 1.3 ХЕ | 109 г (-4%) · 1.1 ХЕ | 109 г (-4%) · 1.1 ХЕ | 109 г (-4%) · 1.1 ХЕ |
| p06 | mandarin 49 g, from above (11°) · 49 г · 0.5 ХЕ | 47 г (-4%) · 0.4 ХЕ | 47 г (-4%) · 0.4 ХЕ | null |
| **MAPE grams** |  | 24% | 12% | 4% |
| **mean signed grams error** |  | +9% | -7% | +1% |
| **mean abs ХЕ error** |  | 0.37 | 0.33 | 0.20 |
| **mean signed ХЕ error** |  | -0.13 | -0.33 | -0.20 |

## Per photo

### p01 — mandarin 49 g, 41° · 49 г

File: `39E8D754-C89C-408D-9D4F-2FB7F713EA33.heic`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | мандарин | table | 53 / 0.8 / 0.3 / 13.3 | 75 49–101 (low) | 54 g (0.72, peel) | the mask does not fit the item (model); visual estimate 75 g | 29 / 0.4 / 0.2 / 7.2 / 0.6 | 1176×1568 | 4978 / 0 / 0 / 407 | 0.0351 | 8.6 | Мean width 3.2 cm is inconsistent with a round 7.0×5.6 cm footprint — the mask appears to stretch into the dark shadow to the right of the fruit. Fill 0.76 is also low for a sphere. |
| sonnet-low-nothink | мандарин | table | 53 / 0.8 / 0.3 / 13.3 | 47 42–52 (high) | 34 g (0.72, peel) · 52.6 ml × 0.94 × 0.95 | volume 53 ml × 0.94 (sphere) × 0.95 (mandarin) = 47 g; gates pass; edible 0.72 (peel) → 34 g | 18 / 0.3 / 0.1 / 4.5 / 0.4 | 1176×1568 | 37831 / 0 / 0 / 418 | 0.0798 ⟲ | 9.2 |  |
| haiku-low-nothink | жёлтая слива | table | 46 / 0.7 / 0.3 / 11.4 | 49 44–54 (high) | 46 g (0.94, stone) · 52.6 ml × 0.94 × 1 | volume 53 ml × 0.94 (sphere) × 1 (plum) = 49 g; gates pass; edible 0.94 (stone) → 46 g | 21 / 0.3 / 0.1 / 5.2 / 0.4 | 1176×1568 | 3864 / 0 / 0 / 555 | 0.0066 | 11.5 | Small golden/yellow plum variety, spherical shape confirmed by sensor fill value of 0.76 which matches sphere classification |

### p02 — apple 242 g, 43° · 242 г

File: `3E464254-9A33-464E-A3F5-A21C98802108.heic`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | яблоко зелёное | table | 52 / 0.3 / 0.2 / 13.8 | 150 98–203 (low) | 135 g (0.9, core) | the mask does not fit the item (model); visual estimate 150 g | 70 / 0.4 / 0.3 / 18.6 / 1.6 | 1176×1568 | 4978 / 0 / 0 / 406 | 0.0350 | 7.8 | Мask footprint 13.0×9.5 cm with mean width 4.9 cm is inconsistent with the round apple (~8 cm wide, height 6.5 cm); it appears to include the shadow cast to the right. Single apple on a wooden table, whole, with slight russeting. |
| sonnet-low-nothink | яблоко зелёное | table | 52 / 0.3 / 0.2 / 13.8 | 150 98–203 (low) | 135 g (0.9, core) | the mask does not fit the item (model); visual estimate 150 g | 70 / 0.4 / 0.3 / 18.6 / 1.6 | 1176×1568 | 5046 / 0 / 0 / 330 | 0.0134 | 5.9 | Footprint length 13.0 cm and width 9.5 cm is much larger than the apple's actual diameter visible in the photo (roughly 7-8 cm); likely includes shadow, so mask does not tightly fit the item. |
| haiku-low-nothink | зелёное яблоко | table | 52 / 0.3 / 0.2 / 13.8 | 242 218–266 (high) | 218 g (0.9, core) · 322.4 ml × 0.94 × 0.8 | volume 322 ml × 0.94 (sphere) × 0.8 (apple) = 242 g; gates pass; edible 0.9 (core) → 218 g | 113 / 0.7 / 0.4 / 30.1 / 2.5 | 1176×1568 | 3864 / 0 / 0 / 583 | 0.0068 | 8.5 | Green apple with visible stem, some brown spots on skin. Measurements are consistent with a spherical item. |

### p03 — apple 113 g, 40° · 113 г

File: `45830E5B-08C4-49B7-96F1-2E41948E1862.heic`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | яблоко красное | table | 52 / 0.3 / 0.2 / 13.8 | 150 98–203 (low) | 135 g (0.9, core) | the mask does not fit the item (model); visual estimate 150 g | 70 / 0.4 / 0.3 / 18.6 / 1.6 | 1176×1568 | 4978 / 0 / 0 / 394 | 0.0347 | 7.5 | Мask elongated (12.1 cm long, mean width 4.3 cm) while the apple is roughly circular ~7 cm; footprint appears to include the shadow cast to the right. Low fill 0.63 also inconsistent with a whole apple. |
| sonnet-low-nothink | яблоко красное | table | 52 / 0.3 / 0.2 / 13.8 | 130 85–176 (low) | 117 g (0.9, core) | the mask does not fit the item (model); visual estimate 130 g | 61 / 0.4 / 0.2 / 16.1 / 1.3 | 1176×1568 | 5046 / 0 / 0 / 328 | 0.0134 | 5.4 | Footprint length 12.1 cm is much larger than the apple's visible diameter (~6-7 cm), suggesting the mask includes shadow or extends beyond the fruit; fill 0.63 is also low for a sphere. |
| haiku-low-nothink | красное яблоко | table | 52 / 0.3 / 0.2 / 13.8 | 127 114–140 (high) | 114 g (0.9, core) · 169.1 ml × 0.94 × 0.8 | volume 169 ml × 0.94 (sphere) × 0.8 (apple) = 127 g; gates pass; edible 0.9 (core) → 114 g | 59 / 0.3 / 0.2 / 15.7 / 1.3 | 1176×1568 | 3864 / 0 / 0 / 577 | 0.0067 | 9.4 |  |

### p04 — apple 242 g, from above (7°) · 242 г

File: `875B68B0-D3A7-4CDF-AA61-F9CE018F27AA.heic`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | груша жёлто-зелёная | table | 57 / 0.4 / 0.1 / 15.2 | 271 244–298 (high) | 244 g (0.9, core) · 303.8 ml × 0.94 × 0.95 | volume 304 ml × 0.94 (sphere) × 0.95 (pear) = 271 g; gates pass; edible 0.9 (core) → 244 g | 139 / 1 / 0.2 / 37.1 / 3.1 | 1176×1568 | 4978 / 0 / 0 / 386 | 0.0345 | 7.3 | Shot from directly above the stem end, so the profile is not visible; round squat outline could be an apple, but the russeted yellow-green skin and stem well suggest a pear standing on its broad base. Fill 0.73 fits a dome on a base. Mask matches the fruit outline. |
| sonnet-low-nothink | Яблоко | table | 52 / 0.3 / 0.2 / 13.8 | 228 205–251 (high) | 205 g (0.9, core) · 303.8 ml × 0.94 × 0.8 | volume 304 ml × 0.94 (sphere) × 0.8 (apple) = 228 g; gates pass; edible 0.9 (core) → 205 g | 107 / 0.6 / 0.4 / 28.3 / 2.4 | 1176×1568 | 5046 / 0 / 0 / 297 | 0.0131 | 5.9 | Russet-type apple with brownish-green skin, viewed from stem end; fill 0.73 fits a sphere-shaped fruit |
| haiku-low-nothink | жёлто-зелёное яблоко | table | 52 / 0.3 / 0.2 / 13.8 | 228 205–251 (high) | 205 g (0.9, core) · 303.8 ml × 0.94 × 0.8 | volume 304 ml × 0.94 (sphere) × 0.8 (apple) = 228 g; gates pass; edible 0.9 (core) → 205 g | 107 / 0.6 / 0.4 / 28.3 / 2.4 | 1176×1568 | 3864 / 0 / 0 / 496 | 0.0063 | 8.8 |  |

### p05 — apple 113 g, from above (7°) · 113 г

File: `B285BBEC-B5C6-4E9B-92A1-0323F77E1A6E.heic`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | яблоко красное | table | 52 / 0.3 / 0.2 / 13.8 | 109 98–120 (high) | 98 g (0.9, core) · 145.5 ml × 0.94 × 0.8 | volume 146 ml × 0.94 (sphere) × 0.8 (apple) = 109 g; gates pass; edible 0.9 (core) → 98 g | 51 / 0.3 / 0.2 / 13.5 / 1.1 | 1176×1568 | 37897 / 0 / 0 / 755 | 0.2084 ⟲ | 13.7 | Вид сверху, яблоко лежит на столе; контур маски совпадает с плодом. Fill 0.84 соответствует шару. |
| sonnet-low-nothink | Красное яблоко | table | 52 / 0.3 / 0.2 / 13.8 | 109 98–120 (high) | 98 g (0.9, core) · 145.5 ml × 0.94 × 0.8 | volume 146 ml × 0.94 (sphere) × 0.8 (apple) = 109 g; gates pass; edible 0.9 (core) → 98 g | 51 / 0.3 / 0.2 / 13.5 / 1.1 | 1176×1568 | 5046 / 0 / 0 / 256 | 0.0127 | 5.8 |  |
| haiku-low-nothink | красное яблоко | table | 52 / 0.3 / 0.2 / 13.8 | 109 98–120 (high) | 98 g (0.9, core) · 145.5 ml × 0.94 × 0.8 | volume 146 ml × 0.94 (sphere) × 0.8 (apple) = 109 g; gates pass; edible 0.9 (core) → 98 g | 51 / 0.3 / 0.2 / 13.5 / 1.1 | 1176×1568 | 3864 / 0 / 0 / 569 | 0.0067 | 8.4 |  |

### p06 — mandarin 49 g, from above (11°) · 49 г

File: `F0BD607A-F9B7-48B5-B596-C531A64D4541.heic`

| config | name | source | per 100 g: kcal / P / F / C | grams (conf) | edible · geometry | basis | portion: kcal / P / F / C / ХЕ | image | tokens in / cache w / cache r / out | cost USD | s | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-low-nothink | мандарин | table | 53 / 0.8 / 0.3 / 13.3 | 47 42–52 (high) | 34 g (0.72, peel) · 52.7 ml × 0.94 × 0.95 | volume 53 ml × 0.94 (sphere) × 0.95 (mandarin) = 47 g; gates pass; edible 0.72 (peel) → 34 g | 18 / 0.3 / 0.1 / 4.5 / 0.4 | 1176×1568 | 37728 / 0 / 0 / 526 | 0.2018 ⟲ | 11.1 | Небольшой жёлтый цитрус на деревянной доске, фото слегка размыто. Средняя ширина (3.9) заметно меньше габаритов — маска, вероятно, слегка сужена, но контур соответствует плоду. |
| sonnet-low-nothink | Мандарин | table | 53 / 0.8 / 0.3 / 13.3 | 47 42–52 (high) | 34 g (0.72, peel) · 52.7 ml × 0.94 × 0.95 | volume 53 ml × 0.94 (sphere) × 0.95 (mandarin) = 47 g; gates pass; edible 0.72 (peel) → 34 g | 18 / 0.3 / 0.1 / 4.5 / 0.4 | 1176×1568 | 5046 / 0 / 0 / 281 | 0.0129 | 6.0 | Снимок сверху, немного размыт; плодоножка видна в центре |
| haiku-low-nothink | манго жёлтое | knowledge | 60 / 0.8 / 0.3 / 15 | — (low) | whole | "манго жёлтое" is not in the product table: no density, no grams | — | 1176×1568 | 3864 / 0 / 0 / 532 | 0.0065 | 8.0 | Mango is not in the product table, so classified as 'other'. The visible pit is characteristic of a whole mango. Mask fits the fruit's outline perfectly. |
