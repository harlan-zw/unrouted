import { defineUnroutedPreset } from '@unrouted/core'
import type { CorsOptions } from 'cors'
import cors from 'cors'
import { name, version } from '../package.json'

export interface PresetConfig {
  cors: boolean | CorsOptions
}

export const presetApi = defineUnroutedPreset<PresetConfig>({
  meta: {
    name,
    version,
  },
  defaults: {
    cors: true,
  },
  setup(ctx, options) {
    if (options.cors) {
      const corsOptions = typeof options.cors === 'boolean' ? {} : options.cors
      // @ts-expect-error custom middleware
      ctx.config.middleware.push(cors(corsOptions))
    }
  },
})
