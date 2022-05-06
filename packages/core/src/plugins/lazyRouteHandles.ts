import { interopDefault } from 'mlly'
import { unroutedEventHandler } from '../util'
import { defineUnroutedPlugin } from '../pluggable'

export default defineUnroutedPlugin({
  meta: {
    name: 'lazyRouteHandles',
  },
  setup({ hooks, logger }) {
    hooks.hook('setup:routes', async (routes) => {
      for (const route of routes) {
        if (typeof route.handle === 'function' && route.handle.name) {
          route.meta.resolve = {
            fn: route.handle.name,
          }
        }
        if (typeof route.handle !== 'string')
          continue
        if (!route.meta.resolve?.module)
          continue

        const module = interopDefault(await route.meta.resolve.module)
        if (!module[route.handle]) {
          logger.warn(`Missing method \`${route.handle}\` from controller ${module.__importMetaUrl}.`)
          continue
        }
        // set meta for types
        route.meta.resolve.fn = route.handle
        route.meta.resolve.file = module.__importMetaUrl
        // try and resolve with meta
        route.handle = unroutedEventHandler(module[route.handle])
        route.handle.__meta__ = route.meta
      }
    })
  },
})
