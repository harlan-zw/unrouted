import { join, resolve } from 'node:path'
import { createUnrouted, get } from '@unrouted/core'
import { presetNode, serve } from '@unrouted/preset-node'

async function simpleServeApi() {
  const unrouted = await createUnrouted({
    name: 'simpleServeApi',
    presets: [
      presetNode({
        generateTypes: true,
      }),
    ],
  })

  await unrouted.setup(() => {
    get('/static/my-sub-api', () => 'hello')
    // serve static files
    serve('/static', resolve(join(__dirname, '..', 'demo')), { dev: true })
  })

  return unrouted
}

export default simpleServeApi
