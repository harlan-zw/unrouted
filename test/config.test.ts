import type { SuperTest, Test } from 'supertest'
import supertest from 'supertest'
import { describe, expect, it } from 'vitest'
import createApi from './fixtures/api/myApi'

describe('config test', () => {
  let request: SuperTest<Test>

  it('default prefix modifies routes', async() => {
    const api = await createApi({
      prefix: '/my-api/',
    })
    request = supertest(api.app)

    const res = await request.get('/my-api/greeting')

    expect(res.text).toEqual('Hello :)')
  })
})
