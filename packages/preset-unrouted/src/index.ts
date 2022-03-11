import type { ConfigPartial } from '@unrouted/core'
import { defineUnroutedPreset } from '@unrouted/core'
import type { CorsOptions } from 'cors'
import cors from 'cors'
import type { Handle } from 'h3'
import { name, version } from '../package.json'
import laravelNamedParams from './plugins/laravelNamedParams'
import generateTypes from './plugins/generateTypes'
import watchExports from './plugins/watchExports'

export interface PresetUnroutedOptions extends ConfigPartial {
  generateTypes: boolean
  laravelNamedParams: boolean
  cors: boolean
  corsOptions: CorsOptions
}

const presetUnrouted = defineUnroutedPreset<PresetUnroutedOptions>({
  meta: {
    name,
    version,
  },
  defaults: {
    generateTypes: false,
    laravelNamedParams: true,
    cors: true,
    corsOptions: {},
  },
  setup(ctx, options) {
    // must be done before generateTypes
    if (options.generateTypes && ctx.config.dev) {
      ctx.config.plugins.push(watchExports())
      ctx.config.plugins.push(generateTypes())
    }
    if (options.laravelNamedParams)
      ctx.config.plugins.push(laravelNamedParams())

    if (options.cors)
      ctx.config.middleware.push(cors(options.corsOptions) as unknown as Handle)
  },
})

export * from './composition'
export { presetUnrouted }
