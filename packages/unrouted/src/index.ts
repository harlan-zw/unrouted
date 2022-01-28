import { createUnrouted as createUnroutedCore } from '@unrouted/core'
import type { PresetUnroutedOptions } from '@unrouted/preset-unrouted'
import { presetUnrouted } from '@unrouted/preset-unrouted'

export function createUnrouted(config: Partial<PresetUnroutedOptions> = {}) {
  return createUnroutedCore({
    ...config,
    presets: [
      presetUnrouted(config),
    ],
  })
}

export * from '@unrouted/preset-unrouted'
