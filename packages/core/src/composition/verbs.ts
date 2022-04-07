import type { RouterMethod } from 'h3'
import type { Route, UnroutedEventHandler } from '../types'
import { registerRoute } from '../util'

type MatchFn = (methods: RouterMethod, route: string, handle: UnroutedEventHandler) => void
type RouteMethod = (route: string, handle: UnroutedEventHandler) => Route

export const match: MatchFn = (methods, route, handle) => registerRoute(methods, route, handle)
export const any: RouteMethod = (route, handle) => registerRoute(['get', 'head', 'post', 'put', 'delete', 'connect', 'options', 'trace'], route, handle)
export const get: RouteMethod = (route, handle) => registerRoute(['get', 'head'], route, handle)
export const post: RouteMethod = (route, handle) => registerRoute('post', route, handle)
export const put: RouteMethod = (route, handle) => registerRoute('put', route, handle)
export const del: RouteMethod = (route, handle) => registerRoute('delete', route, handle)
export const head: RouteMethod = (route, handle) => registerRoute('head', route, handle)
export const options: RouteMethod = (route, handle) => registerRoute('options', route, handle)
