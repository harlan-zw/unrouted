![unrouted - A minimal, composable router built for speed, portability and easy prototyping.](https://repository-images.githubusercontent.com/432034546/262d14fd-f00c-46b9-8b72-423a07dca06f)
<p align="center">
<a href="https://www.npmjs.com/package/@unrouted/core" target="__blank"><img src="https://img.shields.io/npm/v/@unrouted/core?color=2B90B6&label=" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/unrouted" target="__blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/unrouted?color=349dbe&label="></a>
<a href='https://github.com/harlan-zw/unrouted/actions/workflows/test.yml'>
<img src='https://github.com/harlan-zw/unrouted/actions/workflows/test.yml/badge.svg' >
</a>
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

- 🤝 **Portable** Run on any HTTP server - connect, express, Koa, etc. Powered by [h3](https://github.com/unjs/h3)
- 🌳 **Fast Param Routing** blazing speed of [radix3](https://github.com/unjs/radix3), supporting named params (`/user/:id`, `/user/{id}` and `/user/**`)
- 🧩 **Composable Design** Utility functions for defining your api, handling requests and serving responses
- 🏖️ **Easy Prototyping** [cors](https://github.com/expressjs/cors) enabled by default, easy debugging and composable utility for [sirv](https://github.com/lukeed/sirv/tree/master/packages/sirv)
- 🇹 **Generates Types** Automatic types for route paths _(payloads coming soon)_
- ✅ **Built to Test** Testing utility package provided: `@unrouted/test-kit` using [supertest](https://github.com/visionmedia/supertest)
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

Creating unrouted will return the [Unrouted Context](#context).
To get your API setup, you need to make use of two functions: [setup](#context) and [handle](#handle).

3. Create your routes using `setup` and composable functions.

```ts
import { createUnrouted, get, post, useBody } from 'unrouted'
// ...
async function createApi() {
  // ctx is the unrouted context  
  const { setup } = await createUnrouted({
    // options
  })
  
  await setup(() => {
    // example api routes
    get('/ping', 'ok')
    
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

## Guides

### Writing your API

#### Composables

- `get(path: string, res)` - GET route
- `post(path: string, res)` - POST route
- `put(path: string, res)` - PUT route
- `del(path: string, res)` - DELETE route
- `head(path: string, res)` - HEAD route
- `options(path: string, res)` - OPTIONS route
- `any(path: string, res)` - Matches any HTTP method
- `group(prefix: string, () => void)` - Allows you to group composables under a specific prefix
- `match(method: string, path: string, res)` - Matches a specific HTTP method, useful for dynamic method matching
- `permanentRedirect(path: string, toPath: string)` - Performs a permanent redirect
- `redirect(path: string, toPath: string, statusCode: number = 302)` - Performs a temproary redirect by default, you can change the status code
- `serve(path: string, dirname: string, sirvOptions: Options = {})` - Serve static content using [sirv](https://github.com/lukeed/sirv)

For each function which uses res, you can return the following as a primitive or as an async / sync function which returns a primitive:

- `string|boolean` - Will be assumed an HTML response and set the content-type to text/html
- `number` - Will be assumed a status code
- `object` - Will be assumed a JSON response and set the content-type to application/json

```ts
// text/html -> 'api is working' - 200
get('/hello-world', 'api is working')

// application/json -> { success: true, time: 1245456789 } - 200
post('/time', () => {
  return {
    success: true,
    time: new Date().toTimeString(),
  }
})

get('/secret-zone', async () => {
  const authenticated = await authenticate()
  
  if (!authenticated) {
      return 401
  }
  
  return {
    success: true,
    message: 'Welcome to the secret zone!',
  }
})
```

#### API Examples

[Nuxt example](https://github.com/harlan-zw/unrouted/tree/main/playground/nuxt)

[myApi Test Fixture](https://github.com/harlan-zw/unrouted/blob/main/test/fixtures/api/myApi.ts)

#### Setup

Use of the `setup` function is optional.
By defining all of your routes in a predictable way unrouted is able
to provide runtime enhancements through the hooks' system, such as generating types.

For example plugins can make use of the defined routes as:
```ts
const { hooks } = useUnrouted()

hooks.hook('setup:after', ctx => {
    // ctx.routes contains all of the routes defined in the setup function
})
```

### Handling requests and responses

The two main functions you'll use are `useBody` and `useParams`, both are provided as composables with generics.

**Body and Params example**
```ts
interface User {
  name: string
  age: number
}

post('/user/:name', () => {
  const { name } = useParams<{ name: string }>()
  const { age } = useBody<User>()
  // ...
  return {
    success: true,
    user: {
      name,
      age
    }
  }
})
```

```ts
const { name } = useBody<{ name: string }>()
// ts works, name is a string
console.log(name.toUpperCase())
```

Note: Unrouted does not come with validation.


Most functions provided by [h3](https://github.com/unjs/h3) are exposed on `unrouted` as composable utilities.
See the [h3 docs](https://www.jsdocs.io/package/h3#package-functions) for more details.

**Request Utils**

- `useRawBody(encoding?: string)` - Reads the raw body of the request
- `useQuery<T>()` - Reads the query string of the request, has generics support
- `useMethod(defaultMethod?: string)` - Reads the HTTP method of the request
- `isMethod(method: string)` - Checks if the request method is the same as the provided method
- `assertMethod(method: string)` - Asserts that the request method is the same as the provided method
- `useCookies()` - Reads the cookies of the request
- `useCookies(name: string)` - Reads a specific cookie of the request

**Response Utils**

- `setCookie(name: string, value: string, serializeOptions?: any)` - Sets cookie on the response
- `sendRedirect(path: string, statusCode?: number)` - Performs a redirect
- `setStatusCode(statusCode: number)` - Sets the status code of the response
- `sendError(error: Error | H3Error)` - Sends an error response
- `appendHeader(name: string, value: string)` - Appends a header to the response


### Extending composables

If you'd like to create your own composable utility functions,
you can use the low-level `registerRoute` or use the existing composable functions.

**Examples**

Using `registerRoute` we create a new composable function to deny certain paths.

```ts
export const deny = (route: string) => {
  registerRoute('*', route, () => {
    setStatusCode(400)
    return {
      success: false,
      error: 'you\'re not allowed here'
    }
  })
}

// ...
deny('/private-zone/**')
```

We can build on top of existing composable functions to create more complex utilities.

```ts
export const resource = (route: string, factory) => {
  get(route, factory.getAll)
  group(`${route}/:id`, () => {
    get('/', factory.getResource)
    post('/', factory.saveResource)
    del('/', factory.deleteResource)
  })
}
//...
resource('/posts', factory)
```


### Using test-kit with auto-completion

Unrouted comes with package called `@unrouted/test-kit` which provides a simple way to write tests that make use of
generated types. 

1. Add the dependency

```bash
npm install -D @unrouted/test-kit
```

2. Have Unrouted generate types

```ts
import { createUnrouted } from 'unrouted'

await createUnrouted({
  // dev should be dynamic, must be on to generate types
  dev: true,
  generateTypes: true,
  // Optional: if you want to change the output directory of the routes
  root: join(__dirname, '__routes__')
})
```

Now when your code next runs the setup function, the route definitions will be generated.

3. Use the test-kit to write tests

Here we bootstrap Unrouted on our server (such as connect) and create a `request` instance which we'll use to test.

```ts
import { test } from '@unrouted/test-kit'
// this should point to your routes
import { RequestPathSchema } from '../../routes.d.ts'

// createApi is a function which builds the api and returns the handle function  
const api = await createApi({ debug: true })
// tell our server to use the api
app.use(api)
// create a test request instance
const request = testKit<RequestPathSchema>(app)
```

Now you can start testing. See [supertest](https://github.com/visionmedia/supertest) documentation for further testing instructions.
```ts
// /hello-world is autocompleted
request.get('/hello-world')
```

## Unrouted functions

- `createUnrouted` - Create the unrouted instance
- `defineConfig` - Define unrouted config
- `defineUnroutedPlugin` - Define an unrouted plugin
- `defineUnroutedPreset` - Define an unrouted preset
- `useUnrouted` - Use the global unrouted instance

## Hooks

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

*Example*
```ts
import { useUnrouted } from 'unrouted'

const { hooks } = useUnrouted()

hooks.hook('setup:before', () => {
  console.log('before setup')
})
```

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

## Types

### Unrouted Context

```ts

export interface UnroutedContext {
  /**
   * Runtime configuration for the current prefix path.
   */
  prefix: string
  /**
   * Resolved configuration.
   */
  config: ResolvedConfig
  /**
   * Function used to handle a request for the Unrouted instance.
   * This should be passed to a server such as h3, connect, express, koa, etc.
   */
  handle: HandleFn
  /**
   * A flat copy of the normalised routes being used.
   */
  routes: Route[]
  /**
   * The routes grouped by method, this is internally used by the handle function for quicker lookups.
   */
  methodStack: Record<HttpMethod, (RadixRouter<Route>|null)>
  /**
   * The logger instance. Will be Consola if available, otherwise console.
   */
  logger: Consola | Console
  /**
   * The hookable instance, allows hooking into core functionality.
   */
  hooks: UnroutedHookable
  /**
   * Composable setup function for declaring routes.
   * @param fn
   */
  setup: (fn: () => void) => Promise<void>
}
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/harlan-zw/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/harlan-zw/static/sponsors.svg'/>
  </a>
</p>

## License

MIT License © 2022 [Harlan Wilton](https://github.com/harlan-zw)
