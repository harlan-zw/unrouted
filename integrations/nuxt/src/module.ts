import {
  addAutoImport,
  addPlugin,
  clearRequireCache, createResolver,
  defineNuxtModule,
  importModule, resolveModule,
} from '@nuxt/kit'
import type { ConfigPartial, HookResult } from '@unrouted/core'
import { createUnrouted, useUnrouted } from '@unrouted/core'
import { dirname, join, resolve } from 'pathe'
import { globby } from 'globby'
import { watch } from 'chokidar'
import { genImport } from 'knitwork'
import type { NitroContext } from '@nuxt/nitro'
import { presetNode } from '@unrouted/preset-node'
import { presetApi } from '@unrouted/preset-api'
import type { CorsOptions } from 'cors'
import { murmurHash } from 'ohash'
import fse from 'fs-extra'
import virtual from './rollup/plugins/virtual'
import meta from './rollup/plugins/meta'

export interface ModuleOptions extends ConfigPartial {
  cors: boolean | CorsOptions
}

export interface ModuleHooks {
  'unrouted:routes': (paths: string[]) => HookResult
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    configKey: 'unrouted',
    compatibility: {
      bridge: true,
    },
  },
  defaults() {
    return {
      prefix: '/api',
      cors: true,
      name: 'nuxt-unrouted',
    }
  },
  async setup(config, nuxt) {
    const generateTypesPath = join(nuxt.options.buildDir, 'types', 'unrouted.d.ts')
    const routesPath = join(nuxt.options.rootDir, 'server', 'controllers')
    const setupRoutesPath = resolve(nuxt.options.rootDir, 'server', 'routes')

    const { setup } = useUnrouted() || await createUnrouted({
      ...config,
      presets: [
        // cors and proxy support
        presetApi({
          cors: config.cors,
        }),
        // allow type generation
        presetNode({
          setupRoutesPath,
          generateTypes: true,
          generateTypesPath,
          watchRouteExportsPath: routesPath,
        }),
      ],
      name: `${config.name}:parent`,
    })

    const pattern = '**/*.{ts,mjs,js,cjs}'
    let routeFiles = await globby(pattern, { cwd: setupRoutesPath, dot: true })
    // @todo enable const rollupWatcher = null

    const initRoutes = async () => {
      await setup(async () => {
        // import route files and run them
        routeFiles = await globby(pattern, { cwd: setupRoutesPath, dot: true })
        // allow third party routing
        await nuxt.callHook('unrouted:routes', routeFiles)
        for (const file of routeFiles) {
          clearRequireCache(resolve(setupRoutesPath, file))
          const routeModule = await importModule(resolve(setupRoutesPath, file), { clearCache: true, interopDefault: true })
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
          meta({
            routesDir: setupRoutesPath,
          }),
        )
        ni.rollupConfig.plugins.unshift(
          virtual({
            '#unrouted': {
              load: () => {
                const routeCode = routeFiles.map((file) => {
                  const path = resolve(setupRoutesPath, file)
                  const importId = getImportId(path)
                  return {
                    import: genImport(path, { name: importId }),
                    importId,
                  }
                })

                return `import { createUnrouted, useUnrouted } from '@unrouted/core'
${routeCode.map(r => r.import).join('\n')}

export default async () => {
 const existingCtx = useUnrouted()
 if (existingCtx) {
    return existingCtx.router.handler
 }
 const { router, setup } = await createUnrouted({
  ...(${JSON.stringify(config)}),
  debug: true,
  app: true,
  name: '${config.name}:nitro',
 })
 await setup(async () => {
   await ${routeCode.map(r => `${r.importId}()`).join('\n')}
 })
 console.log(router)
 return router.handler
}`
              },
            },
          }),
        )
      })

      // n.middleware.push({
      //   route: '/',
      //   handle: '#unrouted',
      //   // @todo look at making this lazy possibly?
      //   lazy: false,
      // })
    })

    const resolver = createResolver(import.meta.url)
    addPlugin(resolver.resolve('runtime/plugin/fetch'))

    for (const method of ['get', 'patch', 'put', 'post', 'delete', 'options']) {
      addAutoImport({
        name: `$${method}`,
        as: `$${method}`,
        from: dirname(resolveModule('@unrouted/fetch')),
      })
    }

    const watcher = watch([
      join(setupRoutesPath, pattern),
    ], { ignoreInitial: true })
    watcher.on('all', async () => {
      await initRoutes()
    })

    nuxt.hook('close', () => {
      watcher.close()
    })

    nuxt.hook('prepare:types', (opts) => {
      opts.references.push({ path: resolve(nuxt.options.buildDir, 'types/unrouted.d.ts') })
    })

    nuxt.hook('build:done', async () => {
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
