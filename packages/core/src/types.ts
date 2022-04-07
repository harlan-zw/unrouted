import type {
  App,
  CompatibilityEvent,
  CompatibilityEventHandler,
  EventHandler,
  Router,
  RouterMethod,
} from 'h3'
import type { Hookable } from 'hookable'
import type { Consola } from 'consola'
import type { Import } from 'unimport'
import {Handler, Middleware} from "h3";

export type Nullable<T> = { [K in keyof T]: T[K] | null }
export type HookResult<T = void> = Promise<T> | T

export interface UnroutedHooks {
  'setup:after': (ctx: UnroutedContext) => HookResult
  'setup:before': (ctx: UnroutedContext) => HookResult
  'setup:routes': (routes: Route[]) => HookResult
  'response:before': (handler: EventHandler, payload: any) => HookResult
  'request:handle:before': (e: CompatibilityEvent) => HookResult
  'request:error:404': (e: CompatibilityEvent) => HookResult
}

export type UnroutedEventHandler = CompatibilityEventHandler|string

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

export interface ResolvedPlugin {
  meta: { name: string; version?: string }
  setup: (ctx: UnroutedContext) => Promise<any>|any
}

export interface ResolvedConfig {
  app?: App

  prefix: string
  name: string
  debug: boolean

  presets: ResolvedPlugin[]
  plugins: ResolvedPlugin[]
  middleware: CompatibilityEventHandler[]
  hooks: Partial<UnroutedHooks>
}

export type DeepPartial<T> = T extends Function ? T : (T extends object ? { [P in keyof T]?: DeepPartial<T[P]>; } : T)

export type NormaliseRouteFn = (method: HttpMethodInput, urlPattern: string, handle: UnroutedEventHandler, meta?: RouteMeta) => Route
export type RegisterRouteFn = (method: HttpMethodInput, urlPattern: string, handle: UnroutedEventHandler, meta?: RouteMeta) => Route

export type ConfigPartial = DeepPartial<ResolvedConfig>

export interface GroupAttributes {
  middleware?: UnroutedEventHandler[]
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
  app: App
  /**
   * A flat copy of the normalised routes being used.
   */
  routes: Route[]
  router: Router
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

export type HttpMethodInput = RouterMethod | RouterMethod[]

export interface RouteMeta {
  id?: string
  resolve?: {
    module?: unknown
    file?: string
    import?: Import
    fn?: string
  }
  middleware?: UnroutedEventHandler[]
  parameterMatchRegExps?: Record<string, RegExp>
  runtimeTypes?: string
}

export interface Route {
  id: string
  path: string
  handle: UnroutedEventHandler
  method: RouterMethod[]
  meta: RouteMeta
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
