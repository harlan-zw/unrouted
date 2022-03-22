import { join, resolve } from 'path'
import type { ConfigPartial } from '@unrouted/core'
import {
  any,
  createUnrouted,
  del,
  get,
  group,
  match,
  permanentRedirect,
  post,
  prefix,
  redirect,
  useBody,
  useParams,
  useQuery,
} from '@unrouted/core'
import { presetNode, serve } from '@unrouted/preset-node'
import { presetApi } from '@unrouted/preset-api'
import blog from './controllers/blog'

export default async(options: ConfigPartial = {}) => {
  const { setup, handle } = await createUnrouted({
    name: 'api',
    prefix: options.prefix ?? undefined,
    presets: [
      presetApi(),
      presetNode({
        overrideUnroutedModule: false,
        generateTypes: true,
        generateTypesPath: join(__dirname, '__routes__', 'myApi.d.ts'),
      }),
    ],
  })

  await setup(() => {
    post('post-test', () => {
      const { name } = useBody<{ name: string }>()
      return {
        success: true,
        data: {
          name,
        },
      }
    })

    // basic GET
    get('/greeting', () => 'Hello :)')

    // named parameters
    get('/greeting/:name', () => {
      const params = useParams<{ name: string }>()
      const args = {
        greeting: 'Hello',
        smiley: ':)',
        ...useQuery<{ greeting?: string; smiley?: string }>(),
      }
      const { greeting, smiley } = args
      return `${greeting} ${params.name} ${smiley}`
    })

    // serve static files
    serve('/static', resolve(join(__dirname, '..', 'demo')), { dev: true })

    // groups
    prefix('/names', () => {
      const names: string[] = []

      get('/', () => names)
      post('/', async(req, res) => {
        const { name } = useBody<{ name: string }>()
        if (!name) {
          res.statusCode = 422
          return {
            success: false,
            error: 'missing name',
          }
        }
        names.push(name)
        return {
          success: true,
          data: {
            name,
          },
        }
      })
    })

    // redirects
    redirect('/old-link', '/new-link')
    permanentRedirect('/older-link', '/new-permalink')

    get('new-link', () => 'You were redirected temporarily :)')
    get('new-permalink', () => 'You were redirected permanently :)')

    // resource group
    group({
      prefix: '/blog',
      controller: blog,
    }, () => {
      // list
      get('articles', 'getArticles')
      // create
      post('articles', 'createArticle')
      // update
      match(['POST', 'PUT'], 'articles/:id', 'updateArticle')
      // delete
      del('articles/:id', 'deleteArticle')
      // read
      get('articles/:id', 'getArticle')
    })

    any('/any-route', req => req.method)
  })

  return handle
}
