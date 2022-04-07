import { createUnrouted, get, middleware } from '@unrouted/core'
import { throttleRequests } from '../../../packages/preset-api'

export default async() => {
  const { setup, handler } = await createUnrouted({
    name: 'middlewareApi',
  })

  await setup(() => {
    middleware([
      throttleRequests({
        limit: 1,
        time: 100,
      }),
    ], () => {
      get('/throttled', () => 'Hi')
    })
    get('/unthrottled', () => 'Hi')
  })

  return handler
}
