import type { SuperTest, Test } from 'supertest'
import supertest from 'supertest'
import type { Middleware } from 'koa'
import Koa from 'koa'
import { describe } from 'vitest'
import createApi from './fixtures/api/myApi'
import * as assertions from './assertions'

const koa = new Koa()
const server = koa.listen()

describe('koa provider', async() => {
  const api = await createApi({ debug: true })
  const request: SuperTest<Test> = supertest(server)

  // runtime config change to koa provider
  koa.use(api as unknown as Middleware)

  Object.values(assertions)
    .forEach(assertion => assertion(request))

  server.close()
})
