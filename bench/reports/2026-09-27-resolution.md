# Image resolution — Sonnet on fruit and on labels (2026-09-27)

Question: can one image size serve both the fruit branch and label reading, and how small can it be? Sonnet 5 at effort low, thinking off, over the Agent SDK. The stills were resized with `sips` before the run; the server's normalizer (long edge ≤ 1568 px, never enlarged) passed them through unchanged.

## Fruit: the sixteen calibration stills, `/portion/photo`, prompt v5

| Long edge | Image tokens | Input tokens | Cost a call | Time | Retries of 16 | Picks different from 1568 |
|---|---|---|---|---|---|---|
| 1568 | 2 352 | 4 770 | $0.0121 | 5.8 s | 2 | — |
| 784 | 588 | 3 083 | $0.0087 | 4.9 s | 4 | 0 |
| 392 | 154 | 2 678 | $0.0079 | 4.9 s | 6 | 0 |
| 256 | 70 | 2 594 | $0.0076 | 4.4 s | 6 | 0 |

Cost and tokens are averages over calls without a structured-output retry. Product, state, shape and grams were the same on all sixteen stills at every size; only the wording of the names moved ("яблоко" against "яблоко красное"). Below 784 px the ~2.5k tokens of prompt, schema and measurement line are most of the bill. The two older stills were 960 × 1280 and were halved in step (640, then 392 and 256 like the rest).

## Labels: four packages from 2026-09-20, `/nutrition/photo`

Only the Ruštule label has an original (4032 × 3024); the other three exist as 1024 px previews, so their top size is 1024.

| Label | 1568 / 1024 | 784 | 392 |
|---|---|---|---|
| Trik Banini, 480 / P 15 / F 23 / C 51 | right | right | protein 6.5 for 15 |
| Dinosaurus, 413 / F 13 / C 71 | right (413 / F 13 / C 70.7) | fat 9.5 for 13 | table not read: "a seed mix", macros from memory |
| Ruštule, 491 / P 8.8 / F 27.5–27.9 / C 51.5 | right within 0.5 g | right | 454 kcal, protein 5.1 |
| Yogurt 250 g, 55 / P 10 / F 0.1 / C 3.5 | right | right | protein 3.5 for 10, 180 g for 250 |

784 px loses the small multilingual print (the Dinosaurus back); 392 px loses every table, mostly at high confidence. Eleven of the twelve label calls needed a structured-output retry on the Agent SDK (~34k input tokens, $0.07–0.08); the one without cost $0.008, so these costs say nothing about the API.

## Decision

One size for everything: the normalizer's 1568 px stays. The label sets the size, fruit would do with 256 px, and the difference for fruit is about $0.003 a call. Cropping around the tap point was considered and not tested: it needs a tap, which a plain photo does not have.
