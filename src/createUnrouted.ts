import type { ServerResponse } from 'http'
import defu from 'defu'
import { createContext } from 'unctx'
import type { Handle } from 'h3'
import { useBody as useBodyH3, MIMES, promisifyHandle, send, useMethod, sendError, createError } from 'h3'
import { createHooks } from 'hookable'
import { createRouter, MatchedRoute, RadixRouter } from 'radix3'
import cors from 'cors'
import {
  AbstractIncomingMessage,
  HttpMethod,
  UnroutedUserConfig,
  UnroutedResolvedConfig,
  UnroutedRouteDefinition,
  UnroutedRouter,
} from './types'
import * as plugins from './plugins'

const getParamContext = createContext()
const getBodyContext = createContext()

export const useParams: <T>() => T = getParamContext.use
export const useBody: <T>() => T = getBodyContext.use

export function createUnrouted(config = {} as UnroutedUserConfig): UnroutedRouter {
  const resolvedConfig = defu(config, {
    cors: true,
    prefix: '/',
    middleware: [],
  }) as UnroutedResolvedConfig

  if (resolvedConfig.cors)
    resolvedConfig.middleware.push(cors() as unknown as Handle)

  // contains references to the stack
  const methodStack: Record<HttpMethod, RadixRouter<UnroutedRouteDefinition>|null> = {
    // any method
    '*': null,
    'GET': null,
    'HEAD': null,
    'POST': null,
    'PUT': null,
    'DELETE': null,
    'CONNECT': null,
    'OPTIONS': null,
    'TRACE': null,
  }

  const unrouted: Partial<UnroutedRouter> = {
    config: resolvedConfig,
    prefix: resolvedConfig.prefix,
    hooks: createHooks(),
  }

  // add hooks
  if (config.hooks)
    unrouted.hooks?.addHooks(config.hooks)

  unrouted.use = (method, path, handle, options?) => {
    if (handle.length > 2)
      handle = promisifyHandle(handle)
    const routeDefinition: UnroutedRouteDefinition = {
      path,
      handle: handle as Handle,
      options,
    }
    if (!Array.isArray(method))
      method = [method]

    method.forEach((m) => {
      // boot router at runtime
      if (!methodStack[m])
        methodStack[m] = createRouter()
      methodStack[m]!.insert(path, routeDefinition)
    })
    return unrouted as UnroutedRouter
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const plugin in plugins) {
    // @ts-ignore
    plugins[plugin](unrouted as UnroutedRouter)
  }

  const handle = async(req: AbstractIncomingMessage, res: ServerResponse) => {
    req.originalUrl = req.originalUrl || req.url || '/'
    const requestPath = new URL(req.url || '/', `${req.protocol || 'http'}://${req.headers.host}`).pathname

    // eslint-disable-next-line no-restricted-syntax
    for (const m in resolvedConfig.middleware) {
      let middleware = resolvedConfig.middleware[m]
      if (middleware.length > 2)
        middleware = promisifyHandle(middleware)
      // @ts-ignore
      await middleware(req, res)
      if (res.writableEnded)
        return false
    }

    const method = useMethod(req)

    const handlingRoutes: MatchedRoute<UnroutedRouteDefinition>[] = []
    const wildcardStack = methodStack['*']
    if (wildcardStack) {
      const match = wildcardStack.lookup(requestPath)
      if (match)
        handlingRoutes.push(match)
    }
    // match explicit methods first
    const useStack = methodStack[method]
    // no handlers
    if (useStack) {
      const match = useStack.lookup(requestPath)
      if (match)
        handlingRoutes.push(match)
    }

    // no routes to run
    if (!handlingRoutes.length)
      return sendError(res, createError({ statusCode: 404 }))

    // eslint-disable-next-line no-restricted-syntax
    for (const routeKey in handlingRoutes) {
      const h = handlingRoutes[routeKey]
      if (!h || res.writableEnded)
        return false

      getParamContext.set(h.params, true)
      getBodyContext.set(await useBodyH3(req), true)

      // good to execute
      const val = await h.handle(req, res)

      if (res.writableEnded)
        return true

      const type = typeof val
      if (type === 'boolean') {
        return send(res, val.toString(), MIMES.html)
      }
      else if (type === 'string') {
        return send(res, val, MIMES.html)
      }
      else if (type === 'object' && val !== undefined) {
        // Return 'false' and 'null' values as JSON strings
        if (val && val.buffer)
          return send(res, val)
        else
          return send(res, JSON.stringify(val, null, 2), MIMES.json)
      }
    }
  }

  unrouted.handle = async(...args) => {
    // @ts-ignore
    let [req, res, next] = args
    // transform koa
    if (req.req) {
      next = res
      res = req.res
      req = req.req
    }
    await promisifyHandle(handle)(req, res)
    if (next) { // @ts-ignore
      next()
    }
  }

  return unrouted as UnroutedRouter
}
