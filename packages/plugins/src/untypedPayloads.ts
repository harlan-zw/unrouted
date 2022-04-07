import { defineUnroutedPlugin } from '@unrouted/core'
import { untypePayload } from './util'

export default defineUnroutedPlugin({
  meta: {
    name: 'untypedPayloads',
  },
  async setup({ hooks }) {
    // Payload types
    hooks.hook('response:before', async(event, payload) => {
      const meta = event.__meta__
      // if the route already has a file to resolve to then, we don't need to manage types hackily
      if (!meta || meta.resolve?.file || meta.runtimeTypes)
        return
      meta.runtimeTypes = untypePayload(payload, {
        interfaceName: meta.id,
        indentation: 2,
        addDefaults: false,
        addExport: false,
      })
    })
  },
})
