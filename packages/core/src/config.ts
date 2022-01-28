import defu from 'defu'
import { loadConfig } from 'unconfig'
import type { ConfigPartial, ResolvedConfig } from './types'

const defaultConfig = {
  debug: false,
  dev: true,
  prefix: '/',
  middleware: [],
  hooks: {},
  plugins: [],
  presets: [],
  name: '',
}

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
  // create our own config resolution
  config = defu(config, defaultConfig)

  // support loading configuration files
  const configDefinition = await loadConfig<ConfigPartial>({
    cwd: config.root,
    sources: [
      {
        files: [
          'unrouted.config',
          // may provide the config file as an argument
          ...(config.configFile ? [config.configFile] : []),
        ],
        // default extensions
        extensions: ['ts'],
      },
    ],
  })

  if (configDefinition.sources?.[0]) {
    // @ts-expect-error Just in-case it's resolved as a CJS
    const fileConfig = configDefinition.config?.default || configDefinition.config
    config = defu(fileConfig, config)
  }

  return config as ResolvedConfig
}
