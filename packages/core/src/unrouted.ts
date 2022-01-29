import type { ServerResponse } from 'http'
import { URL } from 'url'
import { createContext } from 'unctx'
import { MIMES, promisifyHandle, send, useBody as useBodyH3, useMethod } from 'h3'
import { createHooks } from 'hookable'
import type { MatchedRoute } from 'radix3'
import { createRouter } from 'radix3'
import { withoutTrailingSlash } from 'ufo'
import type {
  AbstractIncomingMessage,
  ConfigPartial,
  HandleFn,
  Nullable,
  Route,
  UnroutedContext,
  UnroutedHooks,
} from './types'
import { createLogger } from './logger'
import { resolveConfig } from './config'

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

  const logger = await createLogger(resolvedConfig.name, resolvedConfig.debug)

  // setup hooks
  const hooks = createHooks<UnroutedHooks>()
  if (config.hooks)
    hooks?.addHooks(config.hooks)

  const innerHandle = async(req: AbstractIncomingMessage, res: ServerResponse) => {
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
    const wildcardStack = methodStack['*']
    if (wildcardStack) {
      const match = wildcardStack.lookup(requestPath)
      if (match) {
        handlingRoutes.push(match)
        logger.debug(`Matched: * \`${match.path}\``)
      }
    }
    // match explicit methods first
    const useStack = methodStack[method]
    // no handlers
    if (useStack) {
      const match = useStack.lookup(requestPath)
      if (match) {
        logger.debug(`Matched: ${method} \`${match.path}\``)
        handlingRoutes.push(match)
      }
    }

    // no routes to run
    if (!handlingRoutes.length) {
      logger.warn(`Failed to route for path: \`${requestPath}\``)
      await hooks.callHook('request:error:404', requestPath, req)
      return
    }

    for (const r of handlingRoutes) {
      if (res.writableEnded)
        return false

      const hasBody = ['PATCH', 'POST', 'PUT', 'DELETE'].includes(method)

      paramCtx.set(r.params, true)
      if (hasBody)
        bodyCtx.set(await useBodyH3(req), true)

      const val = await r.handle(req, res)

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

      let payload = val
      let mime

      logger.debug(`Matched path has returned type \`${type}\`: ${method} \`${r.path}\``)
      await hooks.callHook('request:payload', { req, route: r, payload: val })
      if (type === 'number') {
        res.statusCode = val
        return await send(res, '')
      }
      else if (type === 'boolean') {
        payload = val.toString()
        mime = MIMES.html
      }
      else if (type === 'string') {
        mime = MIMES.html
      }
      else if (type === 'object' && !val?.buffer) {
        // Return 'false' and 'null' values as JSON strings
        mime = MIMES.json
        payload = JSON.stringify(val, null, 2)
      }
      if (payload)
        return await send(res, payload, mime)
    }
  }

  const handle: HandleFn = async(req, res, next) => {
    // avoid any processing if the prefix does not match the url
    if (!req.url.startsWith(resolvedConfig.prefix)) {
      logger.debug(`Skipping \`${req.url}\` does not start with prefix \`${resolvedConfig.prefix}\`.`)
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
    await promisifyHandle(innerHandle)(req, res)
    responseCtx.unset()
    requestCtx.unset()
    if (next)
      next()
  }

  // @ts-expect-error Ctx is not available for extra functions
  const ctx: UnroutedContext = {
    handle,
    hooks,
    logger,
    methodStack: {},
    config: resolvedConfig,
    routes: [],
    prefix: resolvedConfig.prefix,
  }

  ctx.setup = async(fn) => {
    // clear old routes
    ctx.methodStack = {}
    ctx.routes = []
    await ctx.hooks.callHook('setup:before', ctx)
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

  for (const preset of resolvedConfig.presets) {
    await preset.setup(ctx)
    logger.debug(`Using preset: \`${preset.meta.name}\`@\`${preset.meta.version}\``)
  }
  for (const plugin of resolvedConfig.plugins) {
    await plugin.setup(ctx)
    logger.debug(`Using plugin: \`${plugin.meta.name}\`${plugin.meta?.version ? `@\`${plugin.meta.version}\`` : ''}`)
  }

  unroutedCtx.set(ctx)
  return ctx
}
