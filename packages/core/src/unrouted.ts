import type { ServerResponse } from 'http'
import { URL } from 'url'
import { createContext } from 'unctx'
import type { Middleware } from 'h3'
import { callHandle, promisifyHandle, useBody as useBodyH3, useMethod } from 'h3'
import { createHooks } from 'hookable'
import type { MatchedRoute } from 'radix3'
import { createRouter } from 'radix3'
import { withoutTrailingSlash } from 'ufo'
import type {
  AbstractIncomingMessage,
  ConfigPartial,
  HTTPMethodOrWildcard,
  HandleFn,
  Nullable,
  Route,
  UnroutedContext,
  UnroutedHooks,
} from './types'
import { createLogger } from './logger'
import { resolveConfig } from './config'
import { maybeSendInferredResponse } from './util'

const requestCtx = createContext<AbstractIncomingMessage>()
const responseCtx = createContext<ServerResponse>()
const unroutedCtx = createContext<UnroutedContext>()

export const useRequest = requestCtx.use as () => AbstractIncomingMessage
export const useResponse = responseCtx.use as () => ServerResponse
export const useUnrouted = unroutedCtx.use as () => UnroutedContext

const paramCtx = createContext()
const bodyCtx = createContext()
export const useParams: <T>() => T = paramCtx.use
export const useBody: <T>() => Nullable<T> = bodyCtx.use

export async function createUnrouted(config = {} as ConfigPartial): Promise<UnroutedContext> {
  const existingCtx = unroutedCtx.use()
  if (existingCtx) {
    existingCtx.logger.debug('Not creating new unrouted instance, we already have an instance.')
    return existingCtx
  }

  const resolvedConfig = await resolveConfig(config)

  const logger = createLogger(resolvedConfig.name, resolvedConfig.debug)

  logger.debug(`Creating new Unrouted ctx: \`${resolvedConfig.name}\``, resolvedConfig)

  // setup hooks
  const hooks = createHooks<UnroutedHooks>()
  if (config.hooks)
    hooks?.addHooks(config.hooks)

  const innerHandle = async(req: AbstractIncomingMessage, res: ServerResponse) => {
    const now = new Date().getTime()

    req.originalUrl = req.originalUrl || req.url || '/'
    const requestPath = withoutTrailingSlash(new URL(req.url || '/', `${req.protocol || 'http'}://${req.headers.host}`).pathname)

    for (const middleware of resolvedConfig.middleware) {
      await (middleware.length > 2 ? promisifyHandle(middleware) : middleware)(req, res,
        () => logger.debug(`Middleware called next: ${middleware}`),
      )
      if (res.writableEnded)
        return false
    }

    const { methodStack } = useUnrouted()

    const method = useMethod(req)
    logger.debug(`Handling request: ${method} \`${requestPath}\``)

    await hooks.callHook('request:lookup:before', requestPath)
    const handlingRoutes: MatchedRoute<Route>[] = []
    const methodsToMatch: HTTPMethodOrWildcard[] = ['*', method]
    methodsToMatch.forEach((m: HTTPMethodOrWildcard) => {
      if (!methodStack[m])
        return
      const match = methodStack[m]?.lookup(requestPath)
      if (match) {
        logger.debug(`Matched: ${m} \`${match.path}\``)
        handlingRoutes.push(match)
      }
    })
    await hooks.callHook('request:lookup:after', handlingRoutes)

    // no routes to run
    if (!handlingRoutes.length) {
      logger.warn(`Failed to route for path: \`${requestPath}\``)
      await hooks.callHook('request:error:404', requestPath, req)
      return
    }

    for (const r of handlingRoutes) {
      if (res.writableEnded)
        return false

      // call routes middleware
      if (r.meta?.middleware) {
        for (const middleware of r.meta.middleware) {
          const fn = (await middleware)
          await callHandle(fn as Middleware, req, res)
          if (res.writableEnded) {
            logger.warn('Request ended by middleware')
            return false
          }
        }
      }

      const hasBody = ['PATCH', 'POST', 'PUT', 'DELETE'].includes(method)

      let body = null
      if (hasBody)
        body = await useBodyH3(req)
      await hooks.callHook('request:handle:before', { route: r, req, body, res })
      paramCtx.set(r.params || {}, true)
      bodyCtx.set(body || {}, true)

      let val
      if (typeof r.handle === 'string') {
        logger.warn(`Route ${r.path} has invalid handle: ${r.handle}`)
        continue
      }
      val = await callHandle(r.handle, req, res)

      // @todo resolve val util func
      // support nested handles - lazy imports, etc
      if (typeof val === 'function')
        val = await val(req, res, () => {})
      if (val?.default)
        val = await val.default(req, res, () => {})
      const timeTaken = new Date().getTime() - now

      if (!val)
        continue

      // clean up
      paramCtx.unset()
      bodyCtx.unset()

      if (res.writableEnded) {
        logger.debug(`Matched path has ended writing: ${method} \`${r.path}\``)
        return true
      }

      const type = typeof val
      logger.debug(`\`${method} ${r.path}\` ${req.statusCode || 200} ${type} - ${timeTaken}ms`)

      const payload = val
      await hooks.callHook('response:before', { req, route: r, payload })
      await maybeSendInferredResponse(res, payload, { jsonSpacing: 2 })
    }
  }

  const handle: HandleFn = async(req, res, next) => {
    // avoid any processing if the prefix does not match the url
    if (!req.url.startsWith(resolvedConfig.prefix)) {
      logger.debug(`Skipping \`${req.url}\` does not start with prefix \`${resolvedConfig.prefix}\`.`)
      if (next)
        next()
      return
    }
    // transform koa
    if (req.req) {
      next = res
      res = req.res
      req = req.req
    }
    responseCtx.set(res, true)
    requestCtx.set(req, true)
    await callHandle(innerHandle, req, res)
    responseCtx.unset()
    requestCtx.unset()
    if (next)
      next()
  }

  const groupStack = []
  if (resolvedConfig.prefix)
    groupStack.push({ prefix: resolvedConfig.prefix })

  // @ts-expect-error Ctx is not available for extra functions
  const ctx: UnroutedContext = {
    handle,
    hooks,
    logger,
    methodStack: {},
    config: resolvedConfig,
    routes: [],
    groupStack,
  }

  ctx.setup = async(fn) => {
    // clear old routes
    ctx.methodStack = {}
    ctx.routes = []
    await ctx.hooks.callHook('setup:before', ctx)
    if (fn)
      await unroutedCtx.call(ctx, fn)
    await ctx.hooks.callHook('setup:routes', ctx.routes)
    logger.debug(`Setting up ${ctx.routes.length} routes.`)
    ctx.routes.forEach((route) => {
      // register them with our radix3 router
      route.method.forEach((m) => {
        // boot router at runtime
        if (!ctx.methodStack[m])
          ctx.methodStack[m] = createRouter()
        ctx.methodStack[m]!.insert(route.path, route)
      })
    })
    await ctx.hooks.callHook('setup:after', ctx)
  }

  for (const preset of ctx.config.presets) {
    await preset.setup(ctx)
    logger.debug(`Using preset: \`${preset.meta.name}\`@\`${preset.meta.version}\``)
  }
  for (const plugin of ctx.config.plugins) {
    await plugin.setup(ctx)
    logger.debug(`Using plugin: \`${plugin.meta.name}\`${plugin.meta?.version ? `@\`${plugin.meta.version}\`` : ''}`)
  }

  unroutedCtx.set(ctx)
  return ctx
}
