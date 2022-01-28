import type { Test } from 'supertest'
import { expect, it } from 'vitest'
import type { RouteFns } from '@unrouted/test-kit'
import type { RequestPathSchema } from '../../api-routes'

export async function serve(request: RouteFns<RequestPathSchema, Test>) {
  const path = '/static'
  it('serving static works', async() => {
    const indexHtml = await request.get(path)
    expect(indexHtml.ok).toBeTruthy()
    expect(indexHtml.statusCode).toEqual(200)
    expect(indexHtml.text).toMatchSnapshot()

    const image = await request.get(`${path}/img.png`)
    expect(image.ok).toBeTruthy()
    expect(image.statusCode).toEqual(200)
    expect(image.headers['content-type']).toEqual('image/png')
  })
}

export default serve
