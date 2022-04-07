import type { RouteMeta } from './types'

declare module 'h3' {
  interface EventHandler {
    __meta__?: RouteMeta
  }
  interface CompatibilityEventHandler {
    __meta__?: RouteMeta
  }
}
