import type { SuperTest, Test } from 'supertest'
import { expect, it } from 'vitest'

export function cors(request: SuperTest<Test>) {
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
