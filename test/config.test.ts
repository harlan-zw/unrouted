import type { SuperTest, Test } from 'supertest'
import supertest from 'supertest'
import { describe, expect, it } from 'vitest'
import { listen } from 'listhen'
import { toNodeListener } from 'h3'
import createApi from './fixtures/api/myApi'

describe('config test', () => {
  let request: SuperTest<Test>

  it('default prefix modifies routes', async () => {
    const api = await createApi({
      prefix: '/my-api/',
    })

    const server = await listen(toNodeListener(api.app), { open: false })

    request = supertest(server.server)

    const res = await request.get('/my-api/greeting')

    expect(res.text).toEqual('Hello :)')
  })
})
