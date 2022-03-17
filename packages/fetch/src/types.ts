import type { GetRoutes, PostRoutes } from '@unrouted/core'

export type ValueOf<C> = C extends Record<any, any> ? C[keyof C] : never

export type MatchedPostRoutes<Route extends string> = ValueOf<{
  // exact match, prefix match or root middleware
  [key in keyof PostRoutes]: Route extends key | `${key}/${string}` | '/' ? key : never
}>

export type MiddlewareOfPost<Route extends string> = Exclude<PostRoutes[MatchedPostRoutes<Route>], Error | void>

export type TypedInternalPostResponse<Route, Default> =
  Default extends string | boolean | number | null | void | object
    // Allow user overrides
    ? Default
    : Route extends string
      ? MiddlewareOfPost<Route> extends never
        // Bail if only types are Error or void (for example, from middleware)
        ? Default
        : MiddlewareOfPost<Route>
      : Default

export type MatchedGetRoutes<Route extends string> = ValueOf<{
  // exact match, prefix match or root middleware
  [key in keyof GetRoutes]: Route extends key | `${key}/${string}` | '/' ? key : never
}>

export type MiddlewareOfGet<Route extends string> = Exclude<GetRoutes[MatchedGetRoutes<Route>], Error | void>

export type TypedInternalGetResponse<Route, Default> =
  Default extends string | boolean | number | null | void | object
    // Allow user overrides
    ? Default
    : Route extends string
      ? MiddlewareOfGet<Route> extends never
        // Bail if only types are Error or void (for example, from middleware)
        ? Default
        : MiddlewareOfGet<Route>
      : Default
