import type { SuperTest, Test } from 'supertest'
import { expect, it } from 'vitest'
import type { RouteFns } from '@unrouted/test-kit'
import type { RequestPathSchema } from '../../api-routes'

export async function redirects(request: RouteFns<RequestPathSchema, Test>) {
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
