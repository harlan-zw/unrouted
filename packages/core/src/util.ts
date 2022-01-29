import { withBase, withLeadingSlash, withoutTrailingSlash } from 'ufo'
import type { Handle } from 'h3'
import { promisifyHandle } from 'h3'
import type { NormaliseRouteFn, RegisterRouteFn } from './types'
import { useUnrouted } from './unrouted'

/**
 * All route paths have a leading slash and no trailing slash.
 */
const fixSlashes = (s: string) => withLeadingSlash(withoutTrailingSlash(s))

/**
 * Create a normalised route from numerous inputs.
 */
const normaliseRoute: NormaliseRouteFn = (method, path, handle, options?) => {
  const { prefix } = useUnrouted()
  // ensure consistency, apply prefix, this could be from a group or something
  path = withBase(fixSlashes(path), prefix)
  if (handle.length > 2)
    handle = promisifyHandle(handle)
  if (!Array.isArray(method))
    method = [method]
  return {
    path,
    handle: handle as Handle,
    options,
    method,
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
    return
  }
  logger.debug(`Registering route \`${method}\` \`${route.path}\`.`)
  routes.push(route)
}
