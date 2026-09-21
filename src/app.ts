import { Hono } from 'hono'
import { logger } from 'hono/logger'

import { createLlm, LlmError } from './llm/index.js'
import { nutritionRoutes } from './nutrition/nutrition.route.js'

export function createApp(): Hono {
  const llm = createLlm()
  const app = new Hono()

  app.use('*', logger())
  app.get('/', (c) => c.json({ ok: true }))
  app.route('/nutrition', nutritionRoutes(llm))

  app.onError((err, c) => {
    if (err instanceof LlmError) {
      console.error('llm call failed', err.code, err.message, err.cause)
      return c.json({ error: err.message, code: err.code }, 502)
    }
    console.error('unhandled error', err)
    return c.json({ error: 'internal error' }, 500)
  })

  return app
}
