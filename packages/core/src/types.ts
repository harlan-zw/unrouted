import type { IncomingMessage, ServerResponse } from 'http'
import type { Handle, Middleware, PHandle } from 'h3'
import type { Hookable } from 'hookable'
import type { RadixRouter } from 'radix3'
import type { Consola } from 'consola'

export type Nullable<T> = { [K in keyof T]: T[K] | null }
export type HookResult<T = void> = Promise<T> | T

export type HTTPMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE'
export type HttpMethodOrWildcard = HTTPMethod | '*'

export interface UnroutedHooks {
  'setup:after': (ctx: UnroutedContext) => HookResult
  'setup:before': (ctx: UnroutedContext) => HookResult
  'setup:routes': (routes: Route[]) => HookResult
  'request:payload': (ctx: { route: Route; payload: any; req: IncomingMessage }) => HookResult
  'request:lookup:before': (requestPath: string) => HookResult
  'request:error:404': (requestPath: string, req: IncomingMessage) => HookResult
}

export type UnroutedHookable = Hookable<UnroutedHooks>

export type SimpleOptions = Record<string, any>

export interface UnroutedPlugin<T> {
  defaults?: T
  meta: { name: string; version?: string }
  setup: (ctx: UnroutedContext, resolvedOptions: T) => Promise<void>|void
}
export interface UnroutedPreset<T> extends UnroutedPlugin<T> {
}

export interface ResolvedPlugin<T> extends UnroutedPlugin<T> {
  resolvedOptions: T
  setup: (ctx: UnroutedContext) => Promise<void>|void
}

export interface ResolvedConfig {
  prefix: string
  name: string
  debug: boolean
  dev: boolean

  root: string
  resolveFrom: string
  configFile: string

  presets: ResolvedPlugin<SimpleOptions>[]
  plugins: ResolvedPlugin<SimpleOptions>[]
  middleware: Middleware[]|Handle[]
  hooks: Partial<UnroutedHooks>
}

export type DeepPartial<T> = T extends Function ? T : (T extends object ? { [P in keyof T]?: DeepPartial<T[P]>; } : T)

export type HandleFn = ((req: AbstractIncomingMessage|any, res: ServerResponse|any, next: never|(() => void)) => Promise<unknown>)
export type UnroutedHandle = PHandle | Handle | Middleware | string
export type NormaliseRouteFn = (method: HttpMethodInput, urlPattern: string, handle: UnroutedHandle, options?: Record<string, any>) => Route
export type RegisterRouteFn = (method: HttpMethodInput, urlPattern: string, handle: UnroutedHandle, options?: Record<string, any>) => void

export type ConfigPartial = DeepPartial<ResolvedConfig>

export type MethodStack = PartialRecord<HttpMethodOrWildcard, RadixRouter<Route>|null>

export interface UnroutedContext {
  /**
   * Runtime configuration for the current prefix path.
   */
  prefix: string
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

export type HttpMethodInput = HttpMethodOrWildcard | HttpMethodOrWildcard[]

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
}

export interface AbstractIncomingMessage extends IncomingMessage {
  protocol?: string
  originalUrl?: string
}

export interface RouteMeta {
  resolve?: {
    file?: string
    fn: string
  }
  runtimeTypes?: string
}

export interface Route {
  id: string
  path: string
  handle: UnroutedHandle
  method: HttpMethodOrWildcard[]
  match?: (req: IncomingMessage) => boolean
  options?: Record<string, any>
  meta: RouteMeta
}
