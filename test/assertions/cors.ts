import { expect, it } from 'vitest'
import type { RequestTester } from '@unrouted/test-kit'
import type { RequestPathSchema } from '../fixtures/api/__routes__/api-routes'

export function cors(request: RequestTester<RequestPathSchema>) {
  it('shows cors headers on get', async() => {
    const res = await request.get('/greeting')
    expect(res.headers['access-control-allow-origin']).toEqual('*')
  })

  it('shows cors headers on post', async() => {
    const res = await request.post('/post-test').send({ name: 'test' })
    expect(res.headers['access-control-allow-origin']).toEqual('*')
  })
}

export default cors
