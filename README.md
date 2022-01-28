![unrouted - A minimal, composable router built for speed, portability and easy prototyping.](https://repository-images.githubusercontent.com/432034546/262d14fd-f00c-46b9-8b72-423a07dca06f)
<p align="center">
<a href="https://npmjs.com/package/unrouted" target="_blank"><img src="https://img.shields.io/npm/dm/unrouted.svg?style=flat-square"/></a>
<a href="https://www.npmjs.com/package/@unrouted/core" target="__blank"><img src="https://img.shields.io/npm/v/@unrouted/core?color=2B90B6&label=" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/@unrouted/core" target="__blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/@unrouted/core?color=349dbe&label="></a>
</p>

<br>

<p align="center">
<table>
<tbody>
<td align="center">
<img width="2000" height="0" /><br>
Status: <b>Public Beta 🎉</b><br>
<sub>Made possible by my <a href="https://github.com/sponsors/harlan-zw">Sponsor Program 💖</a></sub><br>
<img width="2000" height="0" />
</td>
</tbody>
</table>
</p>


## Features

- 🤝 **Portable** Run it on any HTTP server with any middleware - connect, express, Koa, etc. Powered by [h3](https://github.com/unjs/h3) utilities
- 🌳 **Speedy Routing** [radix3](https://github.com/unjs/radix3) routing, supporting named params (`/user/:id`, `/user/{id}` and wildcards (`/user/*`)
- 🏖️ **Easy Prototyping** [cors](https://github.com/expressjs/cors) enabled and composable utility for [sirv](/)
- 🧩 **Composable** Built beautiful simple APIs with composable utilities `get`, `post` `put`, `del`, `redirect`, `group` etc
- 🇹 **Generates Types** Create automatic types for your routes paths (payloads coming soon)
- ✅ **Built to Test** Testing utility package provided: `@unrouted/test-kit`
- 🐱 **Built to Hack** [hookable hooks](/), preset and plugin system.


## Getting Started

1. Add the dependency.

```bash
# NPM
npm add unrouted
# or Yarn
yarn add unrouted
# or PNPM
pnpm add unrouted
```

2. Create the Unrouted instance.

```ts
import { createUnrouted } from 'unrouted'
// ...
async function createApi() {
  // ctx is the unrouted context  
  const ctx = await createUnrouted({
    // options
  })
}
```

Creating unrouted will return the unrouted context.
To get your API setup, you need to make use of two functions: `setup` and `handle`.

3. Create your routes using `setup` and composable functions.

```ts
import { createUnrouted, get, post } from 'unrouted'
// ...
async function createApi() {
  // ctx is the unrouted context  
  const { setup } = await createUnrouted({
    // options
  })
  
  await setup(() => {
    get('/hello-world', 'api is working')
    
    post('/contact', () => {
      const { email } = useBody<{ email: string }>()
      
      return {
        success: true,
        email,
      }
    })
  })
}
```

The `setup` function ensures the unrouted context is used by the utility functions and lets us perform 
hooks on the final routes provided by your API, such as generating types.

4. Tell your server to handle the request using `handle`.

```ts
import { createUnrouted} from 'unrouted'
// ...
async function createApi() {
  // ctx is the unrouted context  
  const { setup, handle } = await createUnrouted({
    // options
  })
  
  await setup(() => {
    // your api routes
  })
  
  // app could be h3, koa, connect, express servers 
  app.use(handle)
}
```

### Setup Examples

<details>
 <summary>Using <a href="https://github.com/unjs/listhen">listhen and h3</a>.</summary>

```ts
import { createUnrouted, get, post } from 'unrouted'
import { createApp } from 'h3'
import { listen } from 'listhen'

async function createApi() {
  // ctx is the unrouted context  
  const { setup, handle } = await createUnrouted({
    // options
  })

  await setup(() => {
    get('/hello-world', 'api is working')

    post('/contact', () => {
      const { email } = useBody<{ email: string }>()

      return {
        success: true,
        email,
      }
    })
  })

  return handle
}

async function boot() {
  const app = createApp()
  app.use(await createApi())
  listen(app)
}

boot().then(() => {
    console.log('Ready!')
})
```
</details>
<br>
<details>
 <summary>Using <a href="https://github.com/senchalabs/connect">connect</a>.</summary>

```ts
import { createUnrouted, get, post } from 'unrouted'
import createConnectApp from 'connect'

async function createApi() {
  // ctx is the unrouted context  
  const { setup, handle } = await createUnrouted({
    // options
  })

  await setup(() => {
    get('/hello-world', 'api is working')

    post('/contact', () => {
      const { email } = useBody<{ email: string }>()

      return {
        success: true,
        email,
      }
    })
  })

  return handle
}

async function boot() {
  const app = createConnectApp()
  app.use(await createApi())
}

boot().then(() => {
  console.log('Ready!')
})
```
</details>
<br>
<details>
 <summary>Using <a href="https://github.com/expressjs/express">express</a>.</summary>

```ts
import { createUnrouted, get, post } from 'unrouted'
import createExpressApp from 'express'

async function createApi() {
  // ctx is the unrouted context  
  const { setup, handle } = await createUnrouted({
    // options
  })

  await setup(() => {
    get('/hello-world', 'api is working')

    post('/contact', () => {
      const { email } = useBody<{ email: string }>()

      return {
        success: true,
        email,
      }
    })
  })

  return handle
}

async function boot() {
  const app = createExpressApp()
  app.use(await createApi())
}

boot().then(() => {
  console.log('Ready!')
})
```
</details>
<br>
<details>
 <summary>Using <a href="https://github.com/koajs/koa">koa</a>.</summary>

```ts
import { createUnrouted, get, post } from 'unrouted'
import Koa from 'koa'

async function createApi() {
  // ctx is the unrouted context  
  const { setup, handle } = await createUnrouted({
    // options
  })

  await setup(() => {
    get('/hello-world', 'api is working')

    post('/contact', () => {
      const { email } = useBody<{ email: string }>()

      return {
        success: true,
        email,
      }
    })
  })

  return handle
}

async function boot() {
  const koa = new Koa()
  const server = koa.listen()
  koa.use(await createApi())
}

boot().then(() => {
  console.log('Ready!')
})
```
</details>

### Full API Examples

<details>
 <summary>Fixture: myApi.ts</summary>

```ts
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
    prefix: options.prefix ?? undefined,
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
    get('/greeting/:name', (req) => {
      const params = useParams<{ name: string }>()
      const args = {
        greeting: 'Hello',
        smiley: ':)',
        ...useQuery(req)
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
```
</details>

## API

### Creating routes

- `any(path: string, res)`
- `post(path: string, res)`
- `put(path: string, res)`
- `del(path: string, res)`
- `get(path: string, res)`
- `group(path: string, res)` 
- `head(path: string, res)`
- `match(path: string, res)`
- `options(path: string, res)`
- `permanentRedirect(path: string, toPath: string)`
- `redirect(path: string, toPath: string, statusCode: number = 302)`
- `serve(path: string, dirname: string, sirvOptions: Options = {})`

### Interacting with the Request / Response

Most functions provided by [h3](https://github.com/unjs/h3) are exposed on `unrouted`. See the [docs](https://www.jsdocs.io/package/h3#package-functions) for more details.

### Unrouted functions

- `createUnrouted` - Create the unrouted instance
- `defineConfig` - Define unrouted config
- `defineUnroutedPlugin` - Define an unrouted plugin
- `defineUnroutedPreset` - Define an unrouted preset
- `useUnrouted` - Use the global unrouted instance

## Hooks

*Example*
```ts
import { useUnrouted } from 'unrouted'

const { hooks } = useUnrouted()

hooks.hook('setup:before', () => {
  console.log('before setup')
})
```

- `setup:before: (ctx: UnroutedContext) => HookResult;`

Called before the `setup()` function starts. No routes are available yet.

- `setup:after: (ctx: UnroutedContext) => HookResult`

Called after the `setup()` function is finished. At this point, routes are normalised and registered. 

- `setup:routes: (routes: Route[]) => HookResult`

Called when hooks are normalised, can be used to transform the hooks before they are registered
to the router.

- `request:payload: (ctx: PayloadCtx) => HookResult`


When the payload is resolved from your routes.

- `request:lookup:before`: (requestPath: string) => HookResult;

Before the radix3 router is used to look up the route path.

- `request:error:404`: (requestPath: string, req: IncomingMessage) => HookResult;

By default, unrouted, does not handle 404s; this lets you handle it.


## Configuration

You can provide configuration to the `createUnrouted` function directly, provide a `unrouted.config.ts` file or link
a configuration file using `configFile`.

### prefix

  - **Type:** `string`
  - **Default:** `/`

All routes will be served from this prefix.

### name

  - **Type:** `string`
  - **Default:** ``

Setting a name for the unrouted context will allow you
to generate contextual types and have custom scoped debugging logs.

If you only plan to have a single instance of Unrouted, this will likely not be needed.

### debug

  - **Type:** `boolean`
  - **Default:** `false`

Displays debug logs on the bootstrapping and request life cycles.

### dev

  - **Type:** `boolean`
  - **Default:** `false`

Setting the `dev` mode to true allows unrouted to generate types. 

### root

  - **Type:** `string`
  - **Default:** `process.cwd()`

Specify the root where we're running things. This is used for type generation and config loading.

### configFile

  - **Type:** `string`
  - **Default:** `unrouted.config.js`

Specify the location of a config file.

### presets

  - **Type:** `ResolvedPlugin[]`
  - **Default:** `[]`

### plugins

  - **Type:** `ResolvedPlugin[]`
  - **Default:** `[]`

### middleware

  - **Type:** `Middleware[]|Handle[]`
  - **Default:** `[]`

### hooks

  - **Type:** `UnroutedHooks`
  - **Default:** `{}`


## Guides

### Generating types

### Using test-kit



## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/harlan-zw/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/harlan-zw/static/sponsors.svg'/>
  </a>
</p>

## License

MIT License © 2022 [Harlan Wilton](https://github.com/harlan-zw)_
