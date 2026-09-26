import { Hono } from 'hono'

import { availableBackends, portFor, type LlmPorts } from '../llm/index.js'
import { parsePortionRequest } from './portion.request.js'
import { analyzePortion } from './portion.service.js'

export function portionRoutes(llms: LlmPorts): Hono {
  const routes = new Hono()
  const available = availableBackends(llms)

  routes.post('/photo', async (c) => {
    const input = await parsePortionRequest(await c.req.parseBody(), available)
    if ('error' in input) {
      return c.json({ error: input.error }, 400)
    }

    const result = await analyzePortion(portFor(llms, input.backend), input)
    return c.json(result)
  })

  return routes
}
