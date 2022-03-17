import { describe, expect, it } from 'vitest'
import { createApp as createH3App } from 'h3'
import { useUnrouted } from '@unrouted/core'
import testKit from '@unrouted/test-kit'
import laravelApi from '../fixtures/api/laravelApi'

describe('laravel named routes test', async() => {
  const handle = await laravelApi()

  const app = createH3App()

  const request = testKit(app)
  app.use(handle)

  it('named params are substituted', async() => {
    const ctx = useUnrouted()
    expect(ctx?.routes[0].path).toEqual('/user/:id')
  })

  it('endpoint works', async() => {
    const res = await request.get('/user/1234')
    expect(res.text).toEqual('Hi 1234')
  })

  it('fake endpoint fails', async(done) => {
    const ctx = useUnrouted()
    ctx!.hooks.hook('request:error:404', () => {
      done()
    })
    // route will 404
    await request.get('/user/1234/test')
  })
})
