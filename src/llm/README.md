# LLM access: platform-agnostic rules

**Goal.** Several adapters behind one port, one file each, and the caller never
knows which one answers. Today: the Claude Agent SDK (the personal subscription,
always on) and the Messages API with a key — Anthropic's own or OpenRouter's,
the same protocol at another URL. The request picks the backend (`backend`
field); adding a provider is a new adapter file plus one line in `index.ts`,
never a change to calling code.

**Core rule.** The port is defined by the *weakest* backend, not the richest.
Use only capabilities that have a counterpart on every target.

## Port surface
In:  system prompt (plain string), user prompt, model (full id), optional JSON
     Schema, effort, cache on/off, thinking on/off, images (base64 + media type:
     JPEG, PNG, WebP, GIF).
Out: text, parsed data, normalized usage {input, cacheWrite, cacheRead, output}.
Nothing else crosses the boundary.

## Allowed (portable)
Plain-string system prompt · full model ids · effort · structured output via
JSON Schema · thinking · token usage · base64 images.

## Forbidden (agent-loop only — no API counterpart)
Built-in tools (keep the tool list empty) · project config loading (keep setting
sources empty, or CLAUDE.md leaks into every request) · system-prompt presets and
append · sessions, resume, fork · hooks, permission modes, MCP, subagents,
plugins · vendor cost fields · filesystem coupling (cwd, extra dirs) · model
aliases (`sonnet`, `opus`) · image sources other than base64 (URL, file ids).

## Hygiene
1. No vendor types in the port signature. The adapter consumes the vendor's
   stream or response internally and returns a plain result.
2. Own error type from day one; normalize vendor errors inside the adapter.
3. Own usage shape; compute cost yourself from token counts. Fields a backend
   does not report are 0.
4. Capabilities are request flags (e.g. `cache: boolean`), never vendor
   mechanisms leaking outward.
5. No streaming in the port for now — the shapes differ too much to unify cheaply.

## Known non-equivalence
- Web search exists on both sides but with different shapes. Treat it as its own
  port capability, not as a tool name.
- Quality and cost measurements do not transfer between adapters. Re-verify
  after a swap.
- Prompt caching: the Messages API controls it per block, the Agent SDK only via
  a process-wide env flag. The `cache` flag is a hint; usage fields still report
  whatever the backend did. The Agent SDK writes 1-hour entries (2× input price);
  `pricing.ts` assumes that multiplier.
- Backends by key: `ANTHROPIC_API_KEY` → `anthropic`, `OPENROUTER_API_KEY` →
  `openrouter`, read from the environment or `.env` (loaded at startup by
  `process.loadEnvFile`, which never overrides an exported variable). Anthropic
  takes the key as `x-api-key`, OpenRouter only as `Authorization: Bearer` (the
  SDK's `authToken`); the adapter pins both and the base URL, or the SDK would
  fall back to `ANTHROPIC_API_KEY` / `ANTHROPIC_AUTH_TOKEN` / `ANTHROPIC_BASE_URL`
  from the environment. The Agent SDK adapter strips those three and
  `OPENROUTER_API_KEY` from the CLI's environment, or a key in `.env` could bill
  the subscription path or send it to another endpoint. OpenRouter names models
  `anthropic/<id>`; the adapter adds the prefix, the port and the price table
  keep canonical ids. OpenRouter's own fee (a few per cent on credits) is not in
  the cost estimate.
- Structured output on the Messages API is `output_config.format`: when
  `stop_reason` is `end_turn` the body matches the schema, no retry turn exists.
  A cut-off answer (`max_tokens`, `model_context_window_exceeded`) is
  `limit_reached`, a `refusal` is `invalid_output`. `max_tokens` is 32k, the
  CLI's default output cap, which thinking counts against; above ~21k the SDK
  requires streaming, so the adapter streams internally and returns the final
  message — the port still has no streaming. Haiku 4.5 rejects `effort` there;
  the adapter omits it for that model.
- Images: the Agent SDK's CLI shrinks every image block to ≤ 2000 px and
  recompresses JPEG to ≤ 500 KB before sending; the Messages API accepts up to
  8000 px / 10 MB and downscales at 2576 px (Haiku: 1568 px). Callers normalize
  images themselves (`src/images/normalize.ts`, 1568 px) so both backends see
  the same pixels.
- Structured output: the Agent SDK validates the schema on its side and retries
  a mismatch with an extra turn that carries a ~29k-token prefix (cached: cheap;
  with `cache: false`: full price). Sonnet 5 wraps the whole object under the
  array key (`{"items":{"items":[…]}}`) in most calls — renaming the key, a
  second root key and an explicit prompt rule were all tried on 2026-09-20 and
  changed nothing. Opus 5 and Haiku 4.5 never do it. The caller cannot prevent
  the retry; a Messages API adapter would not have it.

## Layout
- `port.ts` — the contract (`LlmPort`, `LlmRequest`, `LlmResult`, `LlmError`).
- `pricing.ts` — price table + cost from token counts.
- `adapters/` — one file per backend; only `index.ts` knows which ones exist.
- `index.ts` — `createLlm()`, the single wiring point: the configured set of backends.

## Changelog
- 2026-09-20 — rules written; images (base64) added to the port after checking
  both backends accept image content blocks.
- 2026-09-20 — cache-write multiplier set to 2 (1-hour entries); image and
  structured-output non-equivalences recorded after the photo benchmark.
- 2026-09-26 — thinking on/off added: both backends take the same three-state
  `thinking` config (adaptive / enabled / disabled); the port exposes only the
  off switch, on = the backend's default.
- 2026-09-26 — the "one live adapter" rule replaced by "several adapters, the
  request picks one": `messages-api.adapter.ts` (Anthropic / OpenRouter by key),
  `LlmBackend`, `createLlm()` returns the configured set.
- 2026-09-26 — review of the backend switch: OpenRouter's key as a Bearer token,
  credentials and URL pinned in the adapter, `stop_reason` checked, the CLI's
  environment stripped of every credential and route variable.
