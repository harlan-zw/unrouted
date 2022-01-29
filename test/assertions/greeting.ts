import { expect, it } from 'vitest'
import type { RequestTester } from '@unrouted/test-kit'
import type { RequestPathSchema } from '../fixtures/api/__routes__/api-routes'

export function greeting(request: RequestTester<RequestPathSchema>) {
  it('simple GET greeting work', async() => {
    const res = await request.get('/greeting')

    expect(res.text).toEqual('Hello :)')
  })

  it('named param GET greeting works', async() => {
    const res = await request.get('/greeting/harlan')
      .query({ greeting: 'Howdy', smiley: '🤠' })

    expect(res.text).toEqual('Howdy harlan 🤠')
  })
}

export default greeting
