import { defineUnroutedPlugin } from '@unrouted/core'
import { interopDefault } from 'mlly'

export default defineUnroutedPlugin({
  meta: {
    name: 'lazyRouteHandles',
  },
  setup({ hooks, logger }) {
    hooks.hook('setup:routes', (routes) => {
      for (const route of routes) {
        if (typeof route.handle !== 'string')
          continue
        if (!route.meta.resolve?.module)
          continue

        const module = interopDefault(route.meta.resolve.module)
        if (!module[route.handle]) {
          logger.warn(`Missing method \`${route.handle}\` from controller.`)
          continue
        }
        // try and resolve with meta
        route.handle = module[route.handle]
      }
    })
  },
})
