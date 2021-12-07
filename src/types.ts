import { IncomingMessage, ServerResponse } from 'http'
import type { Handle, Middleware } from 'h3'
import { Hookable } from 'hookable'
import { HTTPMethod } from 'h3'
import { RouteMethod } from './plugins'

export type UnroutedPlugin = (router: UnroutedRouter) => void

export type Hook = `serve:before-route:${string|''}`|'serve:before-route'

export interface UnroutedResolvedConfig {
  debug: boolean
  cors: boolean
  handle404: boolean
  plugins: UnroutedPlugin[]
  middleware: Middleware[]|Handle[]
  prefix: string
  hooks: Record<Hook, () => Promise<void>|void>
}

export type DeepPartial<T> = T extends Function ? T : (T extends object ? { [P in keyof T]?: DeepPartial<T[P]>; } : T)

export type UnroutedUserConfig = DeepPartial<UnroutedResolvedConfig>

export interface UnroutedRouter {
  config: UnroutedResolvedConfig
  use: (method: HttpMethodInput, urlPattern: string, handle: Handle | Middleware, options?: Record<string, any>) => UnroutedRouter
  // support runtime prefixing
  prefix: string
  handle: (req: AbstractIncomingMessage|any, res: ServerResponse|any) => Promise<unknown>

  hooks: Hookable

  /* plugins */
  // serve static files
  serve: (path: string, dirname: string) => UnroutedRouter
  // group routes
  group: (prefix: string, cb: (router: UnroutedRouter) => void) => void
  // verbs
  match: (methods: HttpMethodInput, route: string, action: Function | string | object) => void
  any: RouteMethod
  get: RouteMethod
  post: RouteMethod
  put: RouteMethod
  del: RouteMethod
  head: RouteMethod
  options: RouteMethod
  // redirects
  redirect: (route: string, location: string, code?: 301|302|307|410|451) => void
  permanentRedirect: (route: string, location: string) => void
}

export type HttpMethod = HTTPMethod | '*'
export type HttpMethodInput = HttpMethod | HttpMethod[]

export interface AbstractIncomingMessage extends IncomingMessage {
  protocol?: string
  originalUrl?: string
}

export interface UnroutedRouteDefinition {
  path: string
  handle: Handle
  match?: (req: IncomingMessage) => boolean
  options?: Record<string, any>
}
