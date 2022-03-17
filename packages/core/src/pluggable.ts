import defu from 'defu'
import type { ResolvedPlugin, SimpleOptions, UnroutedContext, UnroutedPlugin, UnroutedPreset } from './types'

export function defineUnroutedPlugin<T extends SimpleOptions = SimpleOptions>(plugin: UnroutedPlugin<T>): (options?: Partial<T>) => ResolvedPlugin {
  return (options = {}) => {
    return {
      meta: plugin.meta,
      async setup(ctx: UnroutedContext) {
        let defaults = plugin.defaults || {} as T
        if (typeof plugin.defaults === 'function')
          defaults = plugin.defaults(ctx)
        const resolvedOptions = defu<Partial<T>, T>(options, defaults as T) as T
        await plugin.setup(ctx, resolvedOptions as T)
      },
    }
  }
}

export function defineUnroutedPreset<T extends SimpleOptions = SimpleOptions>(preset: UnroutedPreset<T>) {
  return defineUnroutedPlugin(preset)
}
