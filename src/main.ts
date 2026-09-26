import { serve } from '@hono/node-server'

import { createApp } from './app.js'

// keys for the Messages API backends; the Agent SDK adapter hides them from the CLI, so the subscription stays the default
try {
  process.loadEnvFile()
} catch (err) {
  // no .env: only the subscription backend. A malformed one must not pass silently
  if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
    throw err
  }
}

const port = Number(process.env.PORT ?? 3000)

serve({ fetch: createApp().fetch, port }, (info) => {
  console.log(`listening on http://localhost:${info.port}`)
})
