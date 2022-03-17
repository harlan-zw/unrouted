import { expect, it } from 'vitest'
import type { RequestTester } from '@unrouted/test-kit'
import type { RouteSchema } from '../fixtures/api/__routes__/myApiRoutes'

export async function redirects(request: RequestTester<RouteSchema>) {
  it('temporary redirect works', async() => {
    const redirect = await request.get('/old-link')
    expect(redirect.redirect).toBeTruthy()
    expect(redirect.headers.location).toEqual('/new-link')
    expect(redirect.statusCode).toEqual(302)
  })

  it('permanent redirect works', async() => {
    const redirect = await request.get('/older-link')
    expect(redirect.redirect).toBeTruthy()
    expect(redirect.headers.location).toEqual('/new-permalink')
    expect(redirect.statusCode).toEqual(301)
  })
}

export default redirects
