import {
  addAutoImport,
  addPlugin,
  clearRequireCache, createResolver,
  defineNuxtModule,
  importModule, resolveModule,
} from '@nuxt/kit'
import type { ConfigPartial } from '@unrouted/core'
import { createUnrouted, useUnrouted } from '@unrouted/core'
import { dirname, join, resolve } from 'pathe'
import { globby } from 'globby'
import { watch } from 'chokidar'
import { genImport } from 'knitwork'
import type { NitroContext } from '@nuxt/nitro'
import { presetNode } from '@unrouted/preset-node'
import { presetApi } from '@unrouted/preset-api'
import { routeAliasMeta } from '@unrouted/plugins'
import type { CorsOptions } from 'cors'
import { murmurHash } from 'ohash'
import fse from 'fs-extra'
import virtual from './rollup/plugins/virtual'
import alias from './rollup/plugins/alias'

export interface ModuleOptions extends ConfigPartial {
  cors: boolean | CorsOptions
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    configKey: 'unrouted',
    compatibility: {
      bridge: true,
    },
  },
  defaults(nuxt) {
    return {
      prefix: '/api',
      cors: true,
      name: 'nuxt-unrouted',
    }
  },
  async setup(config, nuxt) {
    const { setup } = useUnrouted() || await createUnrouted({
      ...config,
      presets: [
        // cors and proxy support
        presetApi({
          cors: config.cors,
        }),
        // allow type generation
        presetNode({
          setupRoutesPath: resolve(nuxt.options.rootDir, 'server', 'routes'),
          generateTypes: true,
          generateTypesPath: join(nuxt.options.buildDir, 'types', 'unrouted.d.ts'),
          watchRouteExportsPath: join(nuxt.options.rootDir, 'server', 'controllers'),
        }),
      ],
      plugins: [
        routeAliasMeta({
          generateTypesPath: join(nuxt.options.buildDir, 'types', 'unrouted.d.ts'),
          routesPath: join(nuxt.options.rootDir, 'server', 'controllers'),
        }),
      ],
      name: `${config.name}:parent`,
    })

    const pattern = '**/*.{ts,mjs,js,cjs}'
    const routesDir = resolve(nuxt.options.rootDir, 'server', 'routes')
    let routeFiles = await globby(pattern, { cwd: routesDir, dot: true })
    const rollupWatcher = null

    const initRoutes = async() => {
      await setup(async() => {
        // import route files and run them
        routeFiles = await globby(pattern, { cwd: routesDir, dot: true })
        for (const file of routeFiles) {
          clearRequireCache(resolve(routesDir, file))
          const routeModule = await importModule(resolve(routesDir, file), { clearCache: true, interopDefault: true })
          await routeModule()
        }
      })
    }

    nuxt.hooks.hook('nitro:context', (n: NitroContext) => {
      const getImportId = p => `_${murmurHash(p)}`

      n._internal.hooks.hook('nitro:rollup:before', (ni: NitroContext) => {
        if (!ni.rollupConfig?.plugins)
          return

        // @todo
      //   rollupWatcher = startRollupWatcher(ni)
        ni.rollupConfig.plugins.unshift(
          alias({
            routesDir,
          }),
        )
        ni.rollupConfig.plugins.unshift(
          virtual({
            '#unrouted': {
              load: () => {
                const routeCode = routeFiles.map((file) => {
                  const path = resolve(routesDir, file)
                  const importId = getImportId(path)
                  return {
                    import: genImport(path, { name: importId }),
                    importId,
                  }
                })

                return `import { createUnrouted, useUnrouted } from 'unrouted'
${routeCode.map(r => r.import).join('\n')}

export default async () => {
 const existingCtx = useUnrouted()
 if (existingCtx) {
    return existingCtx.handle
 }
 const { handle, setup } = await createUnrouted({
  ...(${JSON.stringify(config)}),
  presets: [],
  debug: true,
  name: '${config.name}:nitro',
 })
 await setup(async () => {
   await ${routeCode.map(r => `${r.importId}()`).join('\n')}
 })
 return handle
}`
              },
            },
          }),
        )
      })

      n.middleware.push({
        route: '/',
        handle: '#unrouted',
        // @todo look at making this lazy possibly?
        lazy: false,
      })
    })

    const resolver = createResolver(import.meta.url)
    addPlugin(resolver.resolve('runtime/plugin/fetch'))

    for (const method of ['get', 'patch', 'put', 'post', 'delete']) {
      addAutoImport({
        name: `$${method}`,
        as: `$${method}`,
        from: dirname(resolveModule('@unrouted/fetch')),
      })
    }

    const watcher = watch([
      join(routesDir, pattern),
    ], { ignoreInitial: true })
    watcher.on('all', async() => {
      await initRoutes()
    })

    nuxt.hook('close', () => {
      watcher.close()
    })

    nuxt.hook('prepare:types', (opts) => {
      opts.references.push({ path: resolve(nuxt.options.buildDir, 'types/unrouted.d.ts') })
    })

    nuxt.hook('build:done', async() => {
      await initRoutes()
      // we sub out unroutes get routes into Nitro's fetch InternalApi
      const nitroTypesPath = resolve(nuxt.options.buildDir, 'types/nitro.d.ts')
      const nitroTypes = await fse.readFile(nitroTypesPath, 'utf-8')
      const unroutedTypes = await fse.readFile(resolve(nuxt.options.buildDir, 'types/unrouted.d.ts'), 'utf-8')
      const regex = /interface GetRoutes {(.*?)\n {2}}/gms
      const match = regex.exec(unroutedTypes)
      await fse.writeFile(
        nitroTypesPath,
        nitroTypes
          .replace('\'/\': Awaited<ReturnType<typeof import("../../../#unrouted").default>>', match[1]),
        { encoding: 'utf-8' },
      )
    })
  },
})
