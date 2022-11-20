import { describe, expect, it } from 'vitest'
import { useUnrouted } from '@unrouted/core'
import testKit from '@unrouted/test-kit'
import { listen } from 'listhen'
import { toNodeListener } from 'h3'
import laravelApi from '../fixtures/api/laravelApi'

describe('laravel named routes test', async () => {
  const api = await laravelApi()

  const server = await listen(toNodeListener(api.app), { open: false })

  const request = testKit(server.server)

  it('named params are substituted', async () => {
    const ctx = useUnrouted()
    expect(ctx?.routes[0].path).toEqual('/user/:id')
  })

  it('endpoint works', async () => {
    const res = await request.get('/user/1234')
    expect(res.text).toEqual('Hi 1234')
  })

  it('fake endpoint fails', async () => {
    const ctx = useUnrouted()
    const p = new Promise<void>((resolve) => {
      ctx!.hooks.hook('request:error:404', () => {
        resolve()
      })
    })
    // route will 404
    await request.get('/user/1234/test')
    await p
  })
})
