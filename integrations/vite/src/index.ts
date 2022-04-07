import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import { join, resolve } from 'pathe'
import type { ConfigPartial } from '@unrouted/core'
import { createUnrouted, useUnrouted } from '@unrouted/core'
import { presetNode } from '@unrouted/preset-node'
import { presetApi } from '@unrouted/preset-api'
import { globby } from 'globby'
import { watch } from 'chokidar'

export default function VitePlugin(pluginOptions: ConfigPartial = {}): Plugin {
  let resolvedConfig: ResolvedConfig
  return {
    name: 'unrouted:vite',
    apply: 'serve',

    configResolved(config) {
      resolvedConfig = config
    },

    async configureServer(viteServer: ViteDevServer) {
      const generateTypesPath = join(resolvedConfig.cacheDir, 'unrouted.d.ts')
      const routesPath = join(resolvedConfig.root, 'src', 'server', 'controllers')
      const setupRoutesPath = resolve(resolvedConfig.root, 'src', 'server', 'routes')

      const { setup, app, config } = useUnrouted() || await createUnrouted({
        ...pluginOptions,
        prefix: '/__api',
        presets: [
          // cors and proxy support
          presetApi({
            cors: pluginOptions.cors,
          }),
          // allow type generation
          presetNode({
            setupRoutesPath,
            generateTypes: true,
            generateTypesPath,
            watchRouteExportsPath: routesPath,
          }),
        ],
        name: `${pluginOptions.name}:parent`,
      })

      viteServer.middlewares.use((req, res, next) => {
        if (req.url?.startsWith(config.prefix))
          app.nodeHandler(req, res)
        else
          next()
      })

      const pattern = '**/*.{ts,mjs,js,cjs}'
      let routeFiles = await globby(pattern, { cwd: setupRoutesPath, dot: true })

      const initRoutes = async() => {
        await setup(async() => {
          // import route files and run them
          routeFiles = await globby(pattern, { cwd: setupRoutesPath, dot: true })
          // allow third party routing
          for (const file of routeFiles) {
            const routeModule = await import(resolve(setupRoutesPath, file))
            await routeModule()
          }
        })
      }

      const watcher = watch([
        join(setupRoutesPath, pattern),
      ], { ignoreInitial: true })
      watcher.on('all', async() => {
        await initRoutes()
      })

      await initRoutes()

      // nuxt.hook('close', () => {
      //   watcher.close()
      // })
    },
    async handleHotUpdate(hmr) {
      //
    },
  }
}
