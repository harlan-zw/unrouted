import { Handle, LazyHandle } from 'h3'
import { withBase } from 'ufo'
import { HttpMethodInput, UnroutedRouter, UnroutedPlugin } from '../types'

export type RouteMethod = (route: string, handle: Handle|LazyHandle|string|object) => UnroutedRouter

type VerbMethod = 'any' | 'get' | 'post' | 'put' | 'del' | 'head' | 'options'

const methods: Record<VerbMethod, HttpMethodInput> = {
  any: ['GET', 'HEAD', 'POST', 'DELETE', 'OPTIONS'],
  get: ['GET', 'HEAD'],
  post: 'POST',
  put: 'PUT',
  del: 'DELETE',
  head: 'HEAD',
  options: 'OPTIONS',
}

export const verbs: UnroutedPlugin = (router) => {
  router.match = (methods: HttpMethodInput, route: string, handle: Handle|LazyHandle|string|object) => {
    // apply prefix, this could be from a group or something
    route = withBase(route, router.prefix)
    if (!route.startsWith('/'))
      route = `/${route}`

    router.use(methods, route, typeof handle === 'function' ? (handle as Handle) : () => handle)
  }

  Object.keys(methods).forEach((method) => {
    const key = method as VerbMethod
    router[key] = (route: string, handle: Function|string|object) => {
      router.match(methods[key], route, handle)
      return router
    }
  })
}
