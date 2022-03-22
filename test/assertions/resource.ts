import { expect, it } from 'vitest'
import type { RequestTester } from '@unrouted/test-kit'
import type { RouteSchema } from '../fixtures/api/__routes__/myApi'

const base = '/blog/articles'

const createArticles = [
  {
    id: 1,
    title: 'Test 1',
  },
  {
    id: 2,
    title: 'Test 2',
  },
]

export function resource(request: RequestTester<RouteSchema>) {
  it('can create 2 articles', async() => {
    let article = createArticles[0]
    let res = await request.post(base).send(article)
    expect(res.body).toEqual(article)

    article = createArticles[1]
    res = await request.post(base).send(article)
    expect(res.body).toEqual(article)
  })

  it('can list', async() => {
    const res = await request.get(base)
    expect(res.body).toEqual(createArticles)
  })

  it('can read first', async() => {
    const res = await request.get(`${base}/${createArticles[0].id}`)
    expect(res.body).toMatchInlineSnapshot(`
      {
        "id": 1,
        "title": "Test 1",
      }
    `)
  })
  it('can read second', async() => {
    const res = await request.get(`${base}/${createArticles[1].id}`)
    expect(res.body).toMatchInlineSnapshot(`
      {
        "id": 2,
        "title": "Test 2",
      }
    `)
  })

  it('can update first', async() => {
    const res = await request.post(`${base}/${createArticles[0].id}`).send({
      title: 'New title',
    })
    expect(res.body).toMatchInlineSnapshot(`
      {
        "id": 1,
        "title": "New title",
      }
    `)
  })

  it('can delete first', async() => {
    const res = await request.del(`${base}/${createArticles[0].id}`)
    expect(res.body).toMatchInlineSnapshot(`
      {
        "id": 1,
      }
    `)
  })

  it('can support GET', async() => {
    const res = await request.get('/any-route')
    expect(res.text).toEqual('GET')
  })
}

export default resource
