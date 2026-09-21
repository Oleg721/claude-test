---
name: dev-server
description: Manages the local Hono development server. Use this skill when the user wants to start, run, or launch the local dev server — triggers on phrases like "run local server", "start dev server", "run local environment", "start the server", "launch the server", "spin up the server", "run the app locally", or "start npm run dev". Also use when the user asks to check if the server is running, restart it, or fix server startup issues.
---

# dev-server

When this skill is triggered, you MUST launch a background Agent to handle the entire server lifecycle. Do NOT run any Bash commands directly in the main conversation — delegate everything to the agent.

## How to invoke

Use the `Agent` tool with `run_in_background: true` and the following prompt. Pass all the instructions below to the agent so it can operate independently.

```
Agent({
  description: "Dev server manager",
  run_in_background: true,
  prompt: <the full prompt below>
})
```

After launching the agent, tell the user: "Starting dev server agent in the background. You'll be notified when it's ready."

## Agent prompt

Pass this entire prompt to the background agent:

---

You are managing the local development server for a Hono + TypeScript project.

- **Project directory:** /Users/oleh/projects/claude-test
- **Start command:** `npm run dev` (runs `tsx watch src/main.ts`)
- **Port:** 3000
- **Health endpoint:** `GET /` at http://localhost:3000/ (returns `{"ok":true}`)

Follow these steps in order:

### Step 1: Pre-check — Is the server already running?

Run via Bash:
```bash
lsof -i :3000 -t
```

- **If the command succeeds** (port 3000 is in use): run a health check:
  ```bash
  curl --silent --fail --max-time 2 http://localhost:3000/
  ```
  - If the health check returns a response → the server is already running. Report back: "Dev server is already running on http://localhost:3000". **Stop here.**
  - If the health check fails → something else is occupying port 3000. Jump to **Step 4a (Port busy)**.

- **If the command fails** (port 3000 is free): proceed to Step 2.

### Step 2: Start the server

Run via Bash with `run_in_background: true`:
```bash
cd /Users/oleh/projects/claude-test && npm run dev
```

Save the output file path returned by Bash — you will need it to read logs if startup fails.

### Step 3: Verify startup

Run a retry loop — up to 5 attempts, 2 seconds apart:
```bash
sleep 2 && curl --silent --fail --max-time 2 http://localhost:3000/
```

- **If any attempt succeeds** → report: "Dev server is running on http://localhost:3000". Proceed to **Step 5 (Monitoring)**.
- **If all 5 attempts fail** → proceed to Step 4 to diagnose the issue.

### Step 4: Error handling

Read the background process output file (from Step 2) using the `Read` tool to identify what went wrong.

#### 4a. Port busy (EADDRINUSE)

The error log contains `EADDRINUSE` or `address already in use`.

1. Kill the process occupying the port:
   ```bash
   kill $(lsof -i :3000 -t)
   ```
2. If `kill` doesn't work, escalate:
   ```bash
   kill -9 $(lsof -i :3000 -t)
   ```
3. Wait 2 seconds, then go back to **Step 2**. Only retry once — if it fails again, report the error.

#### 4b. Missing dependencies

The error log contains `Cannot find module` or `MODULE_NOT_FOUND`.

1. Install dependencies:
   ```bash
   cd /Users/oleh/projects/claude-test && npm install
   ```
2. Go back to **Step 2**. Only retry once.

#### 4c. TypeScript or syntax errors

The error log contains TypeScript compilation errors, syntax errors, or similar code issues.

1. Read the error output carefully.
2. Attempt to fix the TypeScript/syntax error in the source code.
3. After fixing, go back to **Step 2**. Only retry once.

#### 4d. Other errors

Report the last 30 lines of the output file and describe what went wrong.

### Step 5: Background monitoring

After the server is successfully running, set up ongoing health monitoring using the `Monitor` tool.

Use this monitoring script:
```bash
fails=0; while true; do sleep 30; if ! curl --silent --fail --max-time 2 http://localhost:3000/ > /dev/null 2>&1; then fails=$((fails+1)); echo "Health check failed ($fails consecutive)"; if [ $fails -ge 3 ]; then echo "Server appears down after 3 consecutive failures — attempting restart"; cd /Users/oleh/projects/claude-test && npm run dev & sleep 5; if curl --silent --fail --max-time 2 http://localhost:3000/ > /dev/null 2>&1; then echo "Server restarted successfully"; fails=0; else echo "Restart failed — manual intervention needed"; fi; fi; else fails=0; fi; done
```

When the monitor reports the server is down:
- If auto-restart succeeded, report it.
- If auto-restart failed, diagnose using the same error-handling logic from Step 4.

### Important notes

- Working directory is always `/Users/oleh/projects/claude-test`
- Port comes from `PORT` (default 3000) in `src/main.ts`
- Health endpoint is `GET /`
- `tsx watch` auto-reloads on file changes and does NOT typecheck — type errors surface only via `npm run typecheck`; syntax and runtime errors crash the watcher, which the monitor should catch
- Maximum one automatic retry per error type — do not loop indefinitely
