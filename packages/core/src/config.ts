import { defu } from 'defu'
import type { ConfigPartial, ResolvedConfig } from './types'

/**
 * A simple define wrapper to provide typings to config definitions.
 * @param config
 */
export function defineConfig(config: ConfigPartial) {
  return config
}

/**
 * A provided configuration from the user may require runtime transformations to avoid breaking app functionality.
 * @param config
 */
export const resolveConfig: (config: ConfigPartial) => Promise<ResolvedConfig> = async(config) => {
  config = defu(config, {
    debug: false,
    prefix: '/',
    middleware: [],
    hooks: {},
    plugins: [],
    presets: [],
    name: 'unrouted',
  })
  // @todo any config modifications that are needed
  return config as ResolvedConfig
}
