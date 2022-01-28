import type { Test } from 'supertest'
import { expect, it } from 'vitest'
import type { RouteFns } from '@unrouted/test-kit'
import type { RequestPathSchema } from '../../api-routes'

export function greeting(request: RouteFns<RequestPathSchema, Test>) {
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
