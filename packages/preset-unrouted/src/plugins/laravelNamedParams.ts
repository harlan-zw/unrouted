import { defineUnroutedPlugin } from '@unrouted/core'

const LaravelNamedParamRegex = /{([\w]*?)}/gm

export default defineUnroutedPlugin({
  meta: {
    name: 'laravelNamedParams',
  },
  setup({ hooks }) {
    hooks.hook('setup:routes', (routes) => {
      // map the paths for laravel named params
      for (const route of routes)
        route.path = route.path.replace(LaravelNamedParamRegex, ':$1')
    })
  },
})
