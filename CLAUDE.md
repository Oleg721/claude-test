# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with hot reload (tsx watch)
npm run build    # Compile TypeScript to dist/
npm run start    # Run compiled output from dist/
```

No test suite is configured.

## Architecture

A minimal Node.js/TypeScript HTTP server (`index.ts`) that demonstrates the Claude Agent SDK integration.

**Request flow:**
- `GET /home` → static "hello world" response
- `GET /dice/:number` → calls `main()`, which runs an `AnthropicSdc.query()` agentic loop and returns the structured JSON result

**Claude Agent SDK usage pattern:**
- `AnthropicSdc.query()` returns an async generator; iterate with `for await`
- Filter for `message.type === "result" && message.subtype === "success"` to get the final output
- `message.result` contains the text result; `message.structured_output` contains the JSON Schema-validated object
- `outputFormat.type = "json_schema"` with a schema object enables structured outputs

**Key dependencies:**
- `hono` + `@hono/node-server` — HTTP routing
- `@anthropic-ai/claude-agent-sdk` — agentic query loop with tool use
- `@anthropic-ai/sdk` — base Anthropic API client (imported but currently used indirectly)
