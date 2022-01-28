import { createUnrouted as createUnroutedCore } from '@unrouted/core'
import type { PresetUnroutedOptions } from '@unrouted/preset-unrouted'
import { presetUnrouted } from '@unrouted/preset-unrouted'

export * from '@unrouted/core'
export * from '@unrouted/preset-unrouted'

// must export this after @unrouted/core
export function createUnrouted(config: Partial<PresetUnroutedOptions> = {}) {
  return createUnroutedCore({
    ...config,
    presets: [
      presetUnrouted(config),
    ],
  })
}
