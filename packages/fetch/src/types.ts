export type ValueOf<C> = C extends Record<any, any> ? C[keyof C] : never

export type RoutesKey<Route extends string, C> = ValueOf<{
  // exact match, prefix match or root middleware
  [key in keyof C]: Route extends key | '/' ? key : never
}>

export type MiddlewareOf<Route extends string, C> = Exclude<C[RoutesKey<Route, C>], Error | void>

export type TypedInternalResponse<Route, Default, C> =
  Default extends string | boolean | number | null | void | object
    // Allow user overrides
    ? Default
    : Route extends string
      ? MiddlewareOf<Route, C> extends never
        // Bail if only types are Error or void (for example, from middleware)
        ? Default
        : MiddlewareOf<Route, C>
      : Default
