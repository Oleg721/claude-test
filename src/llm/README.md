# LLM access: platform-agnostic rules

**Goal.** Exactly one live adapter at a time. Today: Claude Agent SDK (runs on a
personal Claude subscription). Later: the Claude Messages API (needs an API key)
or another provider. Swapping must be an adapter rewrite — never a change to
calling code.

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
- `adapters/` — one file per backend; only `index.ts` knows which one is live.
- `index.ts` — `createLlm()`, the single swap point.

## Changelog
- 2026-09-20 — rules written; images (base64) added to the port after checking
  both backends accept image content blocks.
- 2026-09-20 — cache-write multiplier set to 2 (1-hour entries); image and
  structured-output non-equivalences recorded after the photo benchmark.
- 2026-09-26 — thinking on/off added: both backends take the same three-state
  `thinking` config (adaptive / enabled / disabled); the port exposes only the
  off switch, on = the backend's default.
