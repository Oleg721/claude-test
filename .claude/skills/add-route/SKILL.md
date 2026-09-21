---
name: add-route
description: Adds a new HTTP endpoint to this Hono playground as a feature folder that talks to Claude only through the LLM port (src/llm). Use whenever the user wants a new API endpoint, route or handler — "add an endpoint for X", "I need a route that does Y", "create a /foo route". Follows the src/nutrition reference layout - prompt, request, service, route, mounted in src/app.ts.
---

# add-route

Adds a feature endpoint. Reference implementation: `src/nutrition/` (`POST /nutrition/photo`).
Rules for every LLM call live in `src/llm/README.md` — read them before designing the prompt.
Layering rules live in `CLAUDE.md` "Rules".

## Steps

1. **Clarify** (only what is not already given): the route (method + path) and what it should
   do, one sentence. Ask nothing else.
2. **Read** `src/llm/port.ts` (request / result shapes), the four files in `src/nutrition/`
   (the shape to copy), `src/app.ts` (where routes mount, where errors are mapped).
3. **Create** `src/<feature>/`:
   - `<feature>.prompt.ts` — `<FEATURE>_SYSTEM_PROMPT` (plain string), `<FEATURE>_SCHEMA: JsonSchema`,
     the result types, and `build<Feature>Prompt(input)` turning typed input into the user prompt.
   - `<feature>.request.ts` — `parse<Feature>Request(body)` turning the wire body into the
     service's input type or `{ error: string }`. Validate by hand (no new deps). Resolve
     `model` via `resolveModel` (`src/models.ts`) and `effort` (low / medium / high / max) with
     defaults here, so the service always gets a full model id.
   - `<feature>.service.ts` — the use case: `export async function <verb><Feature>(llm: LlmPort, input)`
     calls `llm.complete<ResultType>({ system, prompt, model, effort, schema, images? })`, applies
     domain calculations, and returns a plain result `{ ..., stats: { model, effort, usage,
     cost: estimateCost(model, usage), durationMs } }`. Pure math → `<feature>.calc.ts`.
   - `<feature>.route.ts` — `export function <feature>Routes(llm: LlmPort): Hono`. Parse →
     `400 { error }` on a request error → service → `c.json(result)`. No try/catch: `LlmError`
     is mapped to 502 by `app.onError`.
4. **Mount** in `src/app.ts`: `app.route('/<feature>', <feature>Routes(llm))`.
5. **Verify**: `npm run typecheck` green. Do not start the server unless asked.
6. **Document**: add the endpoint to `CLAUDE.md` "Endpoints" (fields, defaults, a curl line) in
   the same change.

## Never

- Import `@anthropic-ai/claude-agent-sdk` or `@anthropic-ai/sdk` outside `src/llm/adapters/`.
- Use anything on the forbidden list in `src/llm/README.md` — built-in tools, sessions, hooks,
  MCP, prompt presets, cwd, aliases inside the port, vendor cost fields.
- Put domain logic, cost math or error mapping in a route.
- Add a dependency (validation, image processing) without asking first.
- Expose raw backend messages or usage objects in a response — only the port's `LlmUsage`
  and the computed cost.
