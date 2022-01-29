import { createUnrouted, useQuery } from 'unrouted'
import { join, resolve } from "path";
import { ConfigPartial, useBody, useParams} from "@unrouted/core";
import { any, del, get, group, match, serve, permanentRedirect, post, redirect } from "unrouted";

type Article = {
  id: number
  title: string
}
let articles : Article[] = []

export default async (options : ConfigPartial = {}) => {
  const { setup, handle } = await createUnrouted({
    name: 'api',
    dev: true,
    prefix: options.prefix ?? undefined,
    generateTypes: true,
    root: join(__dirname, '__routes__')
  })

  await setup(() => {
    post('post-test', () => {
      const {name} = useBody<{ name: string }>()
      return {
        success: true,
        data: {
          name
        }
      }
    })

    // basic GET
    get('/greeting', 'Hello :)')

    // named parameters
    get('/greeting/:name', () => {
      const params = useParams<{ name: string }>()
      const args = {
        greeting: 'Hello',
        smiley: ':)',
        ...useQuery()
      }
      const {greeting, smiley} = args
      return `${greeting} ${params.name} ${smiley}`
    })

    // serve static files
    serve('/static', resolve(join(__dirname, '..', 'demo')))

    // groups
    group('names', () => {
      const names: string[] = []

      get('/', names)
      post('/', async () => {
        const {name} = useBody<{ name: string }>()
        names.push(name)
        return {
          success: true,
          data: {
            name
          }
        }
      })
    })

    // redirects
    redirect('/old-link', '/new-link')
    permanentRedirect('/older-link', '/new-permalink')

    get('new-link', 'You were redirected temporarily :)')
    get('new-permalink', 'You were redirected permanently :)')

    // resource group
    group('blog', () => {
      // list
      get('articles', articles)
      // create
      post('articles', () => {
        const article = useBody<Article>()
        articles.push(article)
        return article
      })
      // update
      match(['POST', 'PUT'], 'articles/:id', () => {
        const {id} = useParams<{ id: number }>()
        const updateData = useBody<Article>()
        let newArticle: null | Article = null
        articles = articles.map((article) => {
          if (article.id !== id) {
            return article
          }
          newArticle = {
            ...article,
            ...updateData,
          }
          return newArticle
        })
        return newArticle
      })
      // delete
      del('articles/:id', () => {
        const {id} = useParams<{ id: number }>()
        articles = articles.filter(article => article.id !== id)
        return {
          id
        }
      })
      // read
      get('articles/:id', () => {
        const {id} = useParams<{ id: number }>()
        const article = articles.filter(article => article.id === id)
        return article[0]
      })
    })

    any('/any-route', (req) => req.method)
  })

  return handle
}
