import { defineUnroutedPreset } from '@unrouted/core'
import type { CompressionOptions } from 'compression'
import { generateTypes, untypedPayloads, watchExports } from '@unrouted/plugins'
import { join } from 'pathe'
import compression from 'compression'
import { fromNodeMiddleware } from 'h3'
import { name, version } from '../package.json'

export interface PresetConfig {
  compression?: CompressionOptions
  generateTypes: boolean
  generateTypesPath: string
  setupRoutesPath: string
  watchRouteExportsPath?: string
  watchRouteExportsPattern?: string
  overrideUnroutedModule: boolean
}

export const presetNode = defineUnroutedPreset<PresetConfig>({
  meta: {
    name,
    version,
  },
  defaults() {
    return {
      overrideUnroutedModule: true,
      generateTypes: true,
      generateTypesPath: join(process.cwd(), '.unrouted', 'types.d.ts'),
      watchRouteExportsPattern: '**/*.{ts,mjs,js,cjs}',
    }
  },
  async setup(ctx, options) {
    // @ts-expect-error untyped
    ctx.config.middleware.push(fromNodeMiddleware(compression(options.compression)))
    if (options.watchRouteExportsPath) {
      ctx.config.plugins.push(watchExports({
        setupRoutesPath: options.setupRoutesPath,
        routesPath: options.watchRouteExportsPath,
        pattern: options.watchRouteExportsPattern,
      }))
    }
    if (options.generateTypes) {
      ctx.config.plugins.push(untypedPayloads())
      ctx.config.plugins.push(generateTypes({
        declareModule: options.overrideUnroutedModule,
        outputPath: options.generateTypesPath,
      }))
    }
  },
})

export * from './composition'
