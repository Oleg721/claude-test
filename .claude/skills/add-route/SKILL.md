---
name: add-route
description: Adds a new Hono route with Claude Agent SDK integration to index.ts. Use this skill whenever the user wants to add a new API endpoint, route, or handler to the server — even if they just say "add an endpoint for X", "I need a route that does Y", or "create a /foo route". Automatically follows the AnthropicSdc.query() agentic loop pattern with json_schema structured output used in the existing codebase.
---

# add-route

Adds a new route to the Hono server in `index.ts`, following the same pattern as existing routes.

## Steps

1. **Ask** the user for two things (if not already provided):
   - The route path (e.g. `/weather/:city`, `/summarize`)
   - What the route should do — a plain English description (e.g. "fetch current weather for a city", "summarize a block of text")

2. **Read** `index.ts` to understand:
   - Where existing routes are defined (look for `app.get(...)`)
   - How `AnthropicSdc.query()` is structured — the `prompt`, `options`, `outputFormat.type = "json_schema"`, and the `for await` result loop
   - The exact code style (indentation, formatting, etc.)

3. **Design** the new route:
   - Write a focused `systemPrompt` that tells Claude what to do for this route
   - Define a `json_schema` output schema appropriate to the route's purpose (e.g. for weather: `{ city, temperature, description }`)
   - Construct a `prompt` that incorporates route parameters (e.g. `c.req.param('city')`)
   - Keep `allowedTools`, `model`, and `effort` consistent with existing routes unless the task clearly requires otherwise

4. **Add** the new route handler to `index.ts`:
   - Place it just before the `serve(...)` call at the bottom
   - Follow the same async handler structure: `app.get('/path/:param', async (c) => { ... })`
   - Use a self-contained `async function` named after the route (similar to `main()`) that runs the `AnthropicSdc.query()` loop and returns `{ result, data }`
   - The route handler calls that function and returns `c.text(JSON.stringify(res, null, 4))`

5. **Confirm** by showing the user the added code block and the new endpoint URL (e.g. `GET http://localhost:3000/weather/:city`).

## Pattern to follow

The existing `/dice/:number` route works like this:

```ts
async function routeName() {
  for await (const message of AnthropicSdc.query({
    prompt: "...",
    options: {
      allowedTools: ["Read", "Edit", "Bash"],
      model: "claude-haiku-4-5",
      effort: "low",
      systemPrompt: `...`,
      outputFormat: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: { /* relevant fields */ },
          required: [/* required fields */]
        }
      }
    }
  })) {
    if (message.type === "result" && message.subtype === "success") {
      return { result: message.result, data: message.structured_output }
    }
  }
  return { result: null }
}

app.get('/your-route/:param', async (c) => {
  const res = await routeName().catch(console.error)
  return c.text(JSON.stringify(res, null, 4))
})
```

Match this structure exactly — don't introduce new imports, middleware, or abstractions.
