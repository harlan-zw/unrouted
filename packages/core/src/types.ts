import type { IncomingMessage, ServerResponse } from 'http'
import type { HTTPMethod, Handle, Middleware } from 'h3'
import type { Hookable } from 'hookable'
import type { RadixRouter } from 'radix3'
import type { Consola } from 'consola'

export type Nullable<T> = { [K in keyof T]: T[K] | null }

export type HookResult<T = void> = Promise<T> | T

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
  configFile: string

  presets: ResolvedPlugin<SimpleOptions>[]
  plugins: ResolvedPlugin<SimpleOptions>[]
  middleware: Middleware[]|Handle[]
  hooks: Partial<UnroutedHooks>
}

export type DeepPartial<T> = T extends Function ? T : (T extends object ? { [P in keyof T]?: DeepPartial<T[P]>; } : T)

export type HandleFn = ((req: AbstractIncomingMessage|any, res: ServerResponse|any, next: never|(() => void)) => Promise<unknown>)
export type NormaliseRouteFn = (method: HttpMethodInput, urlPattern: string, handle: Handle | Middleware, options?: Record<string, any>) => Route
export type RegisterRouteFn = (method: HttpMethodInput, urlPattern: string, handle: Handle | Middleware, options?: Record<string, any>) => void

export type ConfigPartial = DeepPartial<ResolvedConfig>

export interface UnroutedContext {
  // runtime prefix, to support grouping
  prefix: string
  config: ResolvedConfig
  handle: HandleFn
  routes: Route[]
  methodStack: Record<HttpMethod, (RadixRouter<Route>|null)>
  logger: Consola | Console
  hooks: UnroutedHookable
  setup: (fn: () => void) => Promise<void>
}

export type HttpMethod = HTTPMethod | '*'
export type HttpMethodInput = HttpMethod | HttpMethod[]

export interface AbstractIncomingMessage extends IncomingMessage {
  protocol?: string
  originalUrl?: string
}

export interface Route {
  path: string
  handle: Handle
  method: HttpMethod[]
  match?: (req: IncomingMessage) => boolean
  options?: Record<string, any>
}
