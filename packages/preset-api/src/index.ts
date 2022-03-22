import { defineUnroutedPreset } from '@unrouted/core'
import type { CorsOptions } from 'cors'
import cors from 'cors'
import type { Handle } from 'h3'
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
      ctx.config.middleware.push(cors(corsOptions) as unknown as Handle)
    }
  },
})

export * from './middleware'
