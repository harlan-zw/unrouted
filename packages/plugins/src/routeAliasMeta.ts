import { dirname, join, relative } from 'pathe'
import { defineUnroutedPlugin } from '@unrouted/core'

interface PluginConfig {
  routesPath: string
  generateTypesPath: string
}

export default defineUnroutedPlugin<PluginConfig>({
  meta: {
    name: 'routeAliasMeta',
  },
  async setup({ hooks }, options) {
    hooks.hook('setup:routes', async(routes) => {
      for (const route of routes) {
        // record the name of the function calling it
        if (typeof route.handle === 'function' && route.handle.name) {
          route.meta.resolve = {
            // @todo resolve file
            fn: route.handle.name,
          }
        }
        // support routes like #home@greeting
        if (typeof route.handle === 'string' && route.handle.startsWith('#')) {
          const file = (route.handle as string).replace('#', '').split('@')
          const relativePath = relative(dirname(options.generateTypesPath), join(options.routesPath, file[0]))

          route.meta.resolve = {
            file: relativePath,
            fn: file[1] ?? 'default',
          }
        }
      }
    })
  },
})
