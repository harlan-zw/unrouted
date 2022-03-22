import { describe, expect, it } from 'vitest'
import { createApp as createH3App } from 'h3'
import testKit from '@unrouted/test-kit'
import middlewareApi from '../fixtures/api/middlewareApi'

describe('middleware', async() => {
  const handle = await middlewareApi()

  const app = createH3App()

  const request = testKit(app)
  app.use(handle)

  it('endpoint works', async() => {
    let res = await request.get('/throttled')
    expect(res.text).toEqual('Hi')
    expect(res.headers['ratelimit-remaining']).toMatchInlineSnapshot('"0"')
    res = await request.get('/throttled').set('Remote-Addr', '192.168.2.1')
    expect(res.headers['ratelimit-remaining']).toMatchInlineSnapshot('"0"')
    res = await request.get('/throttled').set('Remote-Addr', '192.168.2.1')
    expect(res.statusCode).toMatchInlineSnapshot('200')
  })
})
