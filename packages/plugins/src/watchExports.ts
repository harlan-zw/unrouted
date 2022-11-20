import { defineUnroutedPlugin } from '@unrouted/core'
import type { Import } from 'unimport'
import { scanDirExports } from 'unimport'

interface PluginConfig {
  routesPath: string
  pattern: string
  setupRoutesPath: string
}

export default defineUnroutedPlugin<PluginConfig>({
  meta: {
    name: 'watchExports',
  },
  defaults: {
    pattern: '**/*.{ts,mjs,js,cjs}',
  },
  async setup({ hooks }, options) {
    const mappedRouteExports: Record<string, Import> = {}

    hooks.hook('setup:before', async () => {
      // find exports from controller files
      const imports: Import[] = await scanDirExports(options.routesPath, {
        filePatterns: [options.pattern],
      })
      imports.forEach((e) => {
        // remove extension
        mappedRouteExports[e.name] = e
      })
    })

    hooks.hook('setup:after', async ({ routes }) => {
      for (const r of routes) {
        // handle is likely anonymous
        if (!r.meta.resolve?.fn)
          continue

        // definition file is already known
        if (r.meta.resolve?.file)
          continue

        // explicit export was found
        if (mappedRouteExports[r.meta.resolve.fn])
          r.meta.resolve.import = mappedRouteExports[r.meta.resolve.fn]
      }
    })
  },
})
