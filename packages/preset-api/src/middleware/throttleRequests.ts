import { defineUnroutedMiddleware } from '@unrouted/core'
import rateLimit, { MemoryStore } from 'express-rate-limit'

interface MiddlewareConfig {
  limit: number
  time: number
  headers: boolean
}

export default defineUnroutedMiddleware<MiddlewareConfig>({
  meta: {
    name: 'throttleRequests',
  },
  defaults: {
    limit: 10,
    time: 60,
    headers: true,
  },
  async setup(ctx, options) {
    return rateLimit({
      windowMs: options.time * 60 * 1000,
      max: options.limit,
      statusCode: 500,
      standardHeaders: options.headers,
      legacyHeaders: false,
      store: new MemoryStore(),
    })
  },
})
