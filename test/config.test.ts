import type { SuperTest, Test } from 'supertest'
import supertest from 'supertest'
import { createApp as createH3App } from 'h3'
import createApi from './fixtures/api/myApi'
import { describe, it, expect } from 'vitest'

describe('config test', () => {
  let request: SuperTest<Test>

  it('default prefix modifies routes', async() => {
    const app = createH3App()

    const api = await createApi({
      prefix: '/my-api/',
    })
    request = supertest(app)

    app.use(api)

    const res = await request.get('/my-api/greeting')

    expect(res.text).toEqual('Hello :)')
  })
})
