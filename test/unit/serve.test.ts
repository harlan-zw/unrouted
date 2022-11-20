import type { SuperTest, Test } from 'supertest'
import supertest from 'supertest'
import { describe, expect, it } from 'vitest'
import { listen } from 'listhen'
import { toNodeListener } from 'h3'
import simpleServeApi from '../fixtures/api/simpleServeApi'
import { serve } from '../assertions'

describe('serve static test', async () => {
  const api = await simpleServeApi()
  const server = await listen(toNodeListener(api.app), { open: false })
  const request: SuperTest<Test> = supertest(server.server)

  it('serving sub api works', async () => {
    const subApiResponse = await request.get('/static/my-sub-api')
    expect(subApiResponse.ok).toBeTruthy()
  })

  await serve(request)
})
