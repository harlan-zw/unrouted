import { expect, it } from 'vitest'
import type { RequestTester } from '@unrouted/test-kit'
import {RequestPathSchema} from "../fixtures/api/__routes__/api-routes";

export async function groups(request: RequestTester<RequestPathSchema>) {
  it('simple group POST works', async() => {
    const res = await request.post('/names')
      .set('Accept', 'application/json')
      .send({
        name: 'harlan',
      })

    expect(res.body).toEqual({
      success: true,
      data: {
        name: 'harlan',
      },
    })
  })

  it('group GET works', async() => {
    // test the name was appended and the GET works
    const namesResponse = await request.get('/names')
    expect(namesResponse.body).toEqual(['harlan'])
  })
}

export default groups
