import { defineUnroutedPlugin } from '@unrouted/core'
import type { Import } from 'unimport'
import { resolveFiles, scanExports } from 'unimport'
import type { ParsedStaticImport } from 'mlly'
import { findStaticImports, parseStaticImport } from 'mlly'
import fse from 'fs-extra'

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
    const staticImports: ParsedStaticImport[] = []

    hooks.hook('setup:before', async() => {
      const setupRoutesFiles = await resolveFiles(options.setupRoutesPath, options.pattern)

      await Promise.all(
        setupRoutesFiles.map(async(path) => {
          const si = findStaticImports(await fse.readFile(path, 'utf8'))
          staticImports.push(...(si.map(i => parseStaticImport(i))))
        }),
      )
      console.log(staticImports)

      // find exports from controller files
      const files = await resolveFiles(options.routesPath, options.pattern)
      const imports: Import[] = []

      await Promise.all(
        files.map(async(path) => {
          imports.push(...await scanExports(path))
        }),
      )
      imports.forEach((e) => {
        // remove extension
        mappedRouteExports[e.name] = e
      })
    })

    hooks.hook('setup:after', async({ routes }) => {
      for (const r of routes) {
        // handle is likely anonymous
        if (!r.meta.resolve?.fn)
          continue

        // definition file is already known
        if (r.meta.resolve?.file)
          continue

        // explicit export was found
        if (mappedRouteExports[r.meta.resolve.fn]) {
          r.meta.resolve.import = mappedRouteExports[r.meta.resolve.fn]
          continue
        }
        // use static import meta
        staticImports.filter((i) => {
          if (!i.namedImports)
            return false
          return !!i.namedImports[r.meta.resolve!.fn]
        })
      }
    })
  },
})
