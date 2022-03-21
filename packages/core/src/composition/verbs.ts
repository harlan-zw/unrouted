import type { HTTPMethodOrWildcard, Route, UnroutedHandle } from '../types'
import { registerRoute } from '../util'

type HttpMethodInput = HTTPMethodOrWildcard | HTTPMethodOrWildcard[]
type MatchFn = (methods: HttpMethodInput, route: string, handle: UnroutedHandle) => void
type RouteMethod = (route: string, handle: UnroutedHandle) => Route

export const match: MatchFn = (methods, route, handle) => {
  registerRoute(methods, route, handle)
}

export const any: RouteMethod = (route, handle) => registerRoute('*', route, handle)
export const get: RouteMethod = (route, handle) => registerRoute(['GET', 'HEAD'], route, handle)
export const post: RouteMethod = (route, handle) => registerRoute('POST', route, handle)
export const put: RouteMethod = (route, handle) => registerRoute('PUT', route, handle)
export const del: RouteMethod = (route, handle) => registerRoute('DELETE', route, handle)
export const head: RouteMethod = (route, handle) => registerRoute('HEAD', route, handle)
export const options: RouteMethod = (route, handle) => registerRoute('OPTIONS', route, handle)
