import { createUnrouted, get, useParams } from '@unrouted/core'
import type { ConfigPartial } from '@unrouted/core'
import { laravelNamedParams } from '@unrouted/plugins'

export default async(options: ConfigPartial = {}) => {
  const { setup, handle } = await createUnrouted({
    name: 'laravelApi',
    prefix: options.prefix ?? undefined,
    plugins: [
      laravelNamedParams(),
    ],
  })

  await setup(() => {
    get('/user/{id}', () => `Hi ${useParams<{ id: string }>().id}`)
  })

  return handle
}
