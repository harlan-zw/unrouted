import {
  addServerMiddleware,
  clearRequireCache,
  defineNuxtModule,
  importModule,
} from '@nuxt/kit'
import type { ResolvedConfig } from 'unrouted'
import { createUnrouted, useUnrouted } from 'unrouted'
import { join, resolve } from 'pathe'
import { globby } from 'globby'
import { watch } from 'chokidar'

export interface ModuleOptions extends ResolvedConfig {

}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-unrouted',
    configKey: 'unrouted',
  },
  async setup(data, nuxt) {
    const config = data as ResolvedConfig

    const { setup, handle } = useUnrouted() || await createUnrouted({
      ...config,
      root: nuxt.options.rootDir,
    })
    const pattern = '**/*.{ts,mjs,js,cjs}'
    const routesDir = resolve(nuxt.options.rootDir, 'server', 'routes')

    const initRoutes = async() => {
      await setup(async() => {
        const globalFiles = await globby(pattern, { cwd: routesDir, dot: true })
        for (const file of globalFiles) {
          clearRequireCache(resolve(routesDir, file))
          const module = await importModule(resolve(routesDir, file), {clearCache: true, interopDefault: true})
          await module()
        }
      })
    }

    const watcher = watch([
      join(routesDir, pattern),
    ], { ignoreInitial: true })
    watcher.on('all', async() => {
      await initRoutes()
    })

    await initRoutes()

    addServerMiddleware(handle)
  },
})
