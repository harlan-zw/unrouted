import { defu } from 'defu'
import type { CompatibilityEventHandler } from 'h3'
import type {
  ResolvedPlugin,
  SimpleOptions,
  UnroutedContext,
  UnroutedMiddleware,
  UnroutedPlugin,
  UnroutedPreset,
} from './types'
import { useUnrouted } from './unrouted'

export function defineUnroutedPlugin<T extends SimpleOptions = SimpleOptions>(plugin: UnroutedPlugin<T>): (options?: Partial<T>) => ResolvedPlugin {
  return (options = {}) => {
    return {
      meta: plugin.meta,
      async setup(ctx: UnroutedContext) {
        let defaults = plugin.defaults || {} as T
        if (typeof plugin.defaults === 'function')
          defaults = plugin.defaults(ctx)
        const resolvedOptions = defu<Partial<T>, T>(options, defaults as T) as T
        return await plugin.setup(ctx, resolvedOptions as T)
      },
    }
  }
}

export function defineUnroutedPreset<T extends SimpleOptions = SimpleOptions>(preset: UnroutedPreset<T>) {
  return defineUnroutedPlugin(preset)
}

export function defineUnroutedMiddleware<T extends SimpleOptions = SimpleOptions>(middleware: UnroutedMiddleware<T>): (options?: Partial<T>) => CompatibilityEventHandler {
  return (options = {}) => {
    const m = defineUnroutedPlugin(middleware)(options)
    return m.setup(useUnrouted())
  }
}
