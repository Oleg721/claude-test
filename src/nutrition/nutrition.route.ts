import { Hono } from 'hono'

import { availableBackends, portFor, type LlmPorts } from '../llm/index.js'
import { parsePhotoRequest } from './nutrition.request.js'
import { analyzePhoto } from './nutrition.service.js'

export function nutritionRoutes(llms: LlmPorts): Hono {
  const routes = new Hono()
  const available = availableBackends(llms)

  routes.post('/photo', async (c) => {
    const input = await parsePhotoRequest(await c.req.parseBody(), available)
    if ('error' in input) {
      return c.json({ error: input.error }, 400)
    }

    const result = await analyzePhoto(portFor(llms, input.backend), input)
    return c.json(result)
  })

  return routes
}
