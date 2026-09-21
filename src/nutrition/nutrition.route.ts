import { Hono } from 'hono'

import type { LlmPort } from '../llm/index.js'
import { parsePhotoRequest } from './nutrition.request.js'
import { analyzePhoto } from './nutrition.service.js'

export function nutritionRoutes(llm: LlmPort): Hono {
  const routes = new Hono()

  routes.post('/photo', async (c) => {
    const input = await parsePhotoRequest(await c.req.parseBody())
    if ('error' in input) {
      return c.json({ error: input.error }, 400)
    }

    const result = await analyzePhoto(llm, input)
    return c.json(result)
  })

  return routes
}
