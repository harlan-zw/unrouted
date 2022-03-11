import { defineUnroutedPlugin } from '@unrouted/core'
import { globby } from 'globby'
import { relative, resolve } from 'pathe'
import { findExports } from 'mlly'
import { generateTypes, resolveSchema } from 'untyped'
import fse from 'fs-extra'

export default defineUnroutedPlugin({
  meta: {
    name: 'watchExports',
  },
  async setup({ hooks }) {
    const mappedRouteExports: Record<string, string> = {}

    hooks.hook('setup:before', async({ config }) => {
      const pattern = '**/*.{ts,mjs,js,cjs}'
      const files = await globby(pattern, { cwd: resolve(config.root, config.resolveFrom) })

      for (const f of files) {
        const contents = await fse.readFile(resolve(config.root, config.resolveFrom, f), { encoding: 'utf-8' })
        const exports = findExports(contents)
        exports.forEach((e) => {
          if (e.name) {
            const relativePath = relative(config.root, resolve(config.resolveFrom, f))
            // remove extension
            mappedRouteExports[e.name] = relativePath.replace(/\.[^/.]+$/, '')
          }
        })
      }
    })

    hooks.hook('setup:after', async({ routes }) => {
      for (const r of routes) {
        // handle is likely anonymous
        if (!r.meta.resolve?.fn)
          continue

        // definition file is already known
        if (r.meta.resolve?.file)
          continue

        // export was not found
        if (!mappedRouteExports[r.meta.resolve?.fn])
          continue

        r.meta.resolve.file = mappedRouteExports[r.meta.resolve?.fn]
      }
    })

    // Payload types
    hooks.hook('request:payload', async({ route, payload }) => {
    // if the route already has a file to resolve to then, we don't need to manage types hackily
      if (route.meta.resolve?.file || route.meta.runtimeTypes)
        return
      if (typeof payload === 'string' || typeof payload === 'number')
        route.meta.runtimeTypes = `${payload}|${typeof payload}`
      else
        route.meta.runtimeTypes = generateTypes(resolveSchema(payload), route.id)
    })
  },
})
