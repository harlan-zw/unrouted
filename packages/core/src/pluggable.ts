import defu from 'defu'
import type { ResolvedPlugin, SimpleOptions, UnroutedContext, UnroutedPlugin, UnroutedPreset } from './types'

export function defineUnroutedPlugin<T extends SimpleOptions = SimpleOptions>(plugin: UnroutedPlugin<T>): (options?: Partial<T>) => ResolvedPlugin<T> {
  return (options = {}) => {
    const resolvedOptions = defu<Partial<T>, T>(options, plugin.defaults || {} as T) as T
    return {
      ...plugin,
      resolvedOptions,
      setup: (ctx: UnroutedContext) => plugin.setup(ctx, resolvedOptions as T),
    }
  }
}

export function defineUnroutedPreset<T extends SimpleOptions = SimpleOptions>(preset: UnroutedPreset<T>) {
  return defineUnroutedPlugin(preset)
}
