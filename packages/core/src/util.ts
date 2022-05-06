import { withBase, withLeadingSlash, withoutTrailingSlash } from 'ufo'
import type { CompatibilityEvent, EventHandler, H3Response } from 'h3'
import { murmurHash } from 'ohash'
import { defu } from 'defu'
import type { NormaliseRouteFn, RegisterRouteFn } from './types'
import { useUnrouted } from './unrouted'
import { useMethod } from './composition'

/**
 * All route paths have a leading slash and no trailing slash.
 */
const normaliseSlashes = (s: string) => withLeadingSlash(withoutTrailingSlash(s))

export const resolveStackPrefix = () => {
  const { groupStack } = useUnrouted()
  let path = ''
  // apply all prefixes from the stack
  for (const prefix of groupStack
    .filter(g => !!g.prefix)
    .map(g => g.prefix)
    .reverse()) {
    // ensure consistency, apply prefix, this could be from a group or something
    path = withBase(normaliseSlashes(path), prefix!)
  }
  return path
}

export const resolveStackRouteMeta = () => {
  const { groupStack } = useUnrouted()
  let meta = {}
  // apply all prefixes from the stack
  for (const m of groupStack
    .filter(g => !!g.routeMeta)
    .map(g => g.routeMeta)
    .reverse()) {
    // ensure consistency, apply prefix, this could be from a group or something
    meta = defu(meta, m!)
  }
  return meta
}

export function unroutedEventHandler(handle: any): EventHandler {
  return async (e: CompatibilityEvent) => {
    const now = new Date().getTime()
    const { hooks, logger } = useUnrouted()
    await hooks.callHook('request:handle:before', e)
    const res = await handle(e)
    const timeTaken = new Date().getTime() - now
    logger.debug(`\`${useMethod()} ${e.req.url}\` ${e.req.statusCode || 200} ${typeof res} - ${timeTaken}ms`)
    await hooks.callHook('response:before', handle, res)
    return res as H3Response
  }
}

/**
 * Create a normalised route from numerous inputs.
 */
export const normaliseRoute: NormaliseRouteFn = (method, path, handle, meta?) => {
  // ensure consistency, apply prefix, this could be from a group or something
  path = withBase(normaliseSlashes(path), resolveStackPrefix())
  meta = defu(meta || {}, resolveStackRouteMeta())
  if (!Array.isArray(method))
    method = [method]
  const id = `_${murmurHash(`${method.join(',')} ${path}`)}`
  meta.id = id
  if (typeof handle === 'function') {
    handle = unroutedEventHandler(handle)
    handle.__meta__ = meta
  }
  return {
    id,
    path,
    handle,
    method,
    meta,
  }
}

/**
 * Registers a route with our router.
 *
 * The route is registered asynchronously to allow for plugins to hook into the registration. This means the route won't
 * be immediately available within the Unrouter context.
 */
export const registerRoute: RegisterRouteFn = (method, path, handle, options?) => {
  const route = normaliseRoute(method, path, handle, options)
  const { routes, logger } = useUnrouted()
  if (routes.map(r => r.path).includes(path)) {
    logger.debug('Skipping duplicate route registration')
    return route
  }
  // figure out what code registered this for better error handling and type support
  logger.debug(`Registering route \`${method}\` \`${route.path}\`.`)
  routes.push(route)
  return route
}
