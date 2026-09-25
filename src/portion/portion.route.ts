import { Hono } from 'hono'

import type { LlmPort } from '../llm/index.js'
import { parsePortionRequest } from './portion.request.js'
import { analyzePortion } from './portion.service.js'

export function portionRoutes(llm: LlmPort): Hono {
  const routes = new Hono()

  routes.post('/photo', async (c) => {
    const input = await parsePortionRequest(await c.req.parseBody())
    if ('error' in input) {
      return c.json({ error: input.error }, 400)
    }

    const result = await analyzePortion(llm, input)
    return c.json(result)
  })

  return routes
}
