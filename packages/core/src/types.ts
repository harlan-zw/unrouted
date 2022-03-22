import type { IncomingMessage, ServerResponse } from 'http'
import type { Handle, Middleware, PHandle } from 'h3'
import type { Hookable } from 'hookable'
import type { MatchedRoute, RadixRouter } from 'radix3'
import type { Consola } from 'consola'
import type { Import } from 'unimport'

export type Nullable<T> = { [K in keyof T]: T[K] | null }
export type HookResult<T = void> = Promise<T> | T

export type HTTPMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE'
export type HTTPMethodOrWildcard = HTTPMethod | '*'

export interface UnroutedHooks {
  'setup:after': (ctx: UnroutedContext) => HookResult
  'setup:before': (ctx: UnroutedContext) => HookResult
  'setup:routes': (routes: Route[]) => HookResult
  'response:before': (ctx: { route: Route; payload: any; req: IncomingMessage }) => HookResult
  'request:lookup:before': (requestPath: string) => HookResult
  'request:lookup:after': (matchedRoutes: MatchedRoute<Route>[]) => HookResult
  'request:handle:before': (ctx: { body: unknown; route: Route; res: ServerResponse; req: IncomingMessage }) => HookResult
  'request:error:404': (requestPath: string, req: IncomingMessage) => HookResult
}

export type UnroutedHookable = Hookable<UnroutedHooks>

export type SimpleOptions = Record<string, any>

export interface UnroutedPlugin<T> {
  defaults?: T extends any ? (Partial<T> | ((ctx: UnroutedContext) => Partial<T>)) : never
  meta: { name: string; version?: string }
  setup: (ctx: UnroutedContext, resolvedOptions: T) => Promise<any>|any
}
export interface UnroutedPreset<T> extends UnroutedPlugin<T> {
}
export interface UnroutedMiddleware<T> extends UnroutedPlugin<T> {
}

export interface ResolvedMiddleware {
  meta: { name: string; version?: string }
  setup: (ctx: UnroutedContext) => Promise<UnroutedHandle>|UnroutedHandle
}

export interface ResolvedPlugin {
  meta: { name: string; version?: string }
  setup: (ctx: UnroutedContext) => Promise<any>|any
}

export interface ResolvedConfig {
  prefix: string
  name: string
  debug: boolean

  presets: ResolvedPlugin[]
  plugins: ResolvedPlugin[]
  middleware: Middleware[]|Handle[]
  hooks: Partial<UnroutedHooks>
}

export type DeepPartial<T> = T extends Function ? T : (T extends object ? { [P in keyof T]?: DeepPartial<T[P]>; } : T)

export type HandleFn = ((req: AbstractIncomingMessage|any, res: ServerResponse|any, next: never|(() => void)) => Promise<unknown>)
export type UnroutedHandle = PHandle | Handle | Middleware | string
export type NormaliseRouteFn = (method: HttpMethodInput, urlPattern: string, handle: UnroutedHandle, meta?: RouteMeta) => Route
export type RegisterRouteFn = (method: HttpMethodInput, urlPattern: string, handle: UnroutedHandle, meta?: RouteMeta) => Route

export type ConfigPartial = DeepPartial<ResolvedConfig>

export type MethodStack = PartialRecord<HTTPMethodOrWildcard, RadixRouter<Route>|null>

export interface GroupAttributes {
  middleware?: UnroutedHandle[]
  prefix?: string
  controller?: any
  routeMeta?: RouteMeta
}

export interface UnroutedContext {
  /**
   * Runtime configuration for the current prefix path.
   */
  groupStack: GroupAttributes[]
  /**
   * Resolved configuration.
   */
  config: ResolvedConfig
  /**
   * Function used to handle a request for the Unrouted instance.
   * This should be passed to a server such as h3, connect, express, koa, etc.
   */
  handle: HandleFn
  /**
   * A flat copy of the normalised routes being used.
   */
  routes: Route[]
  /**
   * The routes grouped by method, this is internally used by the handle function for quicker lookups.
   */
  methodStack: MethodStack
  /**
   * The logger instance. Will be Consola if available, otherwise console.
   */
  logger: Consola
  /**
   * The hookable instance, allows hooking into core functionality.
   */
  hooks: UnroutedHookable
  /**
   * Composable setup function for declaring routes.
   * @param fn
   */
  setup: (fn?: () => void) => Promise<void>
}

export type HttpMethodInput = HTTPMethodOrWildcard | HTTPMethodOrWildcard[]

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
}

export interface AbstractIncomingMessage extends IncomingMessage {
  protocol?: string
  originalUrl?: string
}

export interface RouteMeta {
  resolve?: {
    module?: unknown
    file?: string
    import?: Import
    fn?: string
  }
  middleware?: UnroutedHandle[]
  parameterMatchRegExps?: Record<string, RegExp>
  runtimeTypes?: string
}

export interface Route {
  id: string
  path: string
  handle: UnroutedHandle
  method: HTTPMethodOrWildcard[]
  match?: (req: IncomingMessage) => boolean
  meta: RouteMeta
  // fns @todo
  // where: (arg) => Route
  // whereNumber: (arg) => Route
  // whereAlpha: (arg) => Route
  // whereAlphaNumeric: (arg) => Route
  // whereUuid: (arg) => Route
  // name: (name: string) => Route
}

export interface GetRoutes {}
export interface PostRoutes {}
export interface PutRoutes {}
export interface PatchRoutes {}
export interface DeleteRoutes {}
export interface OptionsRoutes {}

export interface RouteSchema {
  get: GetRoutes
  post: PostRoutes
  put: PutRoutes
  patch: PatchRoutes
  delete: DeleteRoutes
  options: OptionsRoutes
}
