import type { HTTPMethod, Handle } from 'h3'
import { registerRoute } from '@unrouted/core'

type HttpMethod = HTTPMethod | '*'
type HttpMethodInput = HttpMethod | HttpMethod[]
type MatchFn = (methods: HttpMethodInput, route: string, action: (() => (string|object|number|void)|Promise<string|object|number|void>) | string|object|number) => void
type RouteMethod = (route: string, handle: Handle|string|object) => void

const match: MatchFn = (methods, route, handle) => {
  registerRoute(methods, route, typeof handle === 'function' ? (handle as Handle) : () => handle)
}

const any: RouteMethod = (route, handle) => match('*', route, handle)
const get: RouteMethod = (route, handle) => match(['GET', 'HEAD'], route, handle)
const post: RouteMethod = (route, handle) => match('POST', route, handle)
const put: RouteMethod = (route, handle) => match('PUT', route, handle)
const del: RouteMethod = (route, handle) => match('DELETE', route, handle)
const head: RouteMethod = (route, handle) => match('HEAD', route, handle)
const options: RouteMethod = (route, handle) => match('OPTIONS', route, handle)

export {
  match,
  any,
  get,
  post,
  put,
  del,
  head,
  options,
}
