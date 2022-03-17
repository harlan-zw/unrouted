import { defineUnroutedPlugin } from '@unrouted/core'
import { untypePayload } from './util'

export default defineUnroutedPlugin({
  meta: {
    name: 'untypedPayloads',
  },
  async setup({ hooks }) {
    // Payload types
    hooks.hook('response:before', async({ route, payload }) => {
    // if the route already has a file to resolve to then, we don't need to manage types hackily
      if (route.meta.resolve?.file || route.meta.runtimeTypes)
        return
      route.meta.runtimeTypes = untypePayload(payload, {
        interfaceName: route.id,
        indentation: 2,
        addDefaults: false,
        addExport: false,
      })
    })
  },
})
