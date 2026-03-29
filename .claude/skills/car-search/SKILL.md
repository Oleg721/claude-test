---
name: car-search
description: Use this skill when the user wants to find, buy, or search for cars in a specific country or market, especially when they mention a budget or price range. Triggers on phrases like "what car can I buy in [country] for [budget]", "best used cars in [country]", "top cars to buy for $X", "car recommendations in [market]", "what to buy for X dollars in [country]", or any request to find/recommend cars within a budget in a specific region. Always use this skill even if the user just says "find me a car" or "what car should I buy" — it will help clarify the market and budget if needed.
version: 1.0.0
---

# Car Search Skill

Help the user find the best cars available in a specific market for their budget.

## What to gather

You need at minimum:
- **Country/market** — e.g. Ukraine, Germany, Poland, USA
- **Budget in USD** — e.g. $13,000

Optional but useful:
- Car type preference (sedan, SUV, hatchback, electric)
- New vs. used preference (default: used, since new cars rarely fit tight budgets)
- Fuel type preference (petrol, diesel, hybrid, electric)

If the user hasn't provided these, ask briefly before searching. If budget or country is already in the conversation, use it — don't re-ask.

## Search strategy

1. Search for: `"top used cars [country] [budget] dollars [current year]"` and `"best cars to buy [country] [price range]"`
2. Also search for the dominant local car marketplace for that country (see list below) and check listings directly
3. Look for both editorial recommendations and real marketplace data

### Known local marketplaces by country

| Country | Marketplace |
|---------|-------------|
| Ukraine | auto.ria.com — search `auto.ria.com/uk/price/[budget]/` |
| Germany | mobile.de, autoscout24.de |
| Poland | otomoto.pl |
| USA | cars.com, autotrader.com |
| UK | autotrader.co.uk |
| France | leboncoin.fr, lacentrale.fr |
| Romania | autovit.ro |
| Czech Republic | sauto.cz |
| Lithuania/Latvia/Estonia | auto24.ee, autoplius.lt |

If the country isn't listed, search for `"[country] used car marketplace"` to find the right one.

## Output format

Return a ranked list of **top 5 cars** using this structure:

---

### Top 5 Cars in [Country] for ~$[Budget]

**1. [Make Model] ([Year range])**
- **Price range:** ~$X,000–$X,000
- **Why it's a good pick:** 2-3 sentence summary of reliability, parts availability, running costs, why it's popular in that market
- **Watch out for:** one common issue to check at purchase

*(repeat for 2–5)*

---

**Where to search:** [Marketplace name](URL)

**Tips for [country]:**
- Any market-specific advice (e.g. customs/import rules, common mileage fraud, seasonal price drops)

---

## Quality guidelines

- Prioritize cars **common in that market** — a car popular in the US may be rare and expensive to maintain in Eastern Europe
- Weight toward models with **cheap local parts and service** — this matters more than brand prestige at lower budgets
- Be honest about budget constraints — if $13k is tight for a given market, say so and explain what that buys
- Include a mix of body types if the user hasn't specified
- If budget is very tight (under $5k), lean toward reliability over features
- Always include the local marketplace link so the user can check live listings
