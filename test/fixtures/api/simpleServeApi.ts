import { join, resolve } from 'path'
import { createUnrouted, get } from '@unrouted/core'
import { presetNode, serve } from '@unrouted/preset-node'

const simpleServeApi = async() => {
  const { setup, handle } = await createUnrouted({
    name: 'simpleServeApi',
    presets: [
      presetNode({
        generateTypes: true,
      }),
    ],
  })

  await setup(() => {
    get('/static/my-sub-api', () => 'hello')
    // serve static files
    serve('/static', resolve(join(__dirname, '..', 'demo')), { dev: true })
  })

  return handle
}

export default simpleServeApi
