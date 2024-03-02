import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Stats } from 'node:fs'
import sirv from 'sirv'
import { withBase, withLeadingSlash, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import { registerRoute, resolveStackPrefix, useUnrouted } from '@unrouted/core'
import { defu } from 'defu'
import type { H3Event } from 'h3'
import { dynamicEventHandler } from 'h3'

type Arrayable<T> = T | T[]

interface SirvOptions {
  dev?: boolean
  etag?: boolean
  maxAge?: number
  immutable?: boolean
  single?: string | boolean
  ignores?: false | Arrayable<string | RegExp>
  extensions?: string[]
  dotfiles?: boolean
  brotli?: boolean
  gzip?: boolean
  onNoMatch?: (req: IncomingMessage, res: ServerResponse) => void
  setHeaders?: (res: ServerResponse, pathname: string, stats: Stats) => void
}

export interface ServeArguments {
  path: string
  dirname: string
  sirvOptions?: SirvOptions
}

/**
 * Serve static files from a directory using sirv.
 */
function serve(path: string, dirname: string, sirvOptions: SirvOptions = {}) {
  const ctx = useUnrouted()!

  sirvOptions = defu(sirvOptions, {
    single: true,
    dev: true,
  })

  path = withBase(path, resolveStackPrefix())
  path = withTrailingSlash(withLeadingSlash(path))

  const serveArguments: ServeArguments = {
    path,
    dirname,
    sirvOptions,
  }

  // allow user to configure serve with a hook
  // @ts-expect-error hook type removed temporarily
  ctx.hooks.callHook('serve:register', serveArguments).then(() => {
    const handle = dynamicEventHandler(async (e: H3Event) => {
      const req = e.node.req
      const res = e.node.res
      // we need to strip the path from the req.url for sirv to work
      if (serveArguments.path && serveArguments.path !== '/')
        req.url = withTrailingSlash(req.url?.replace(serveArguments.path, '') || '/')
      // @ts-expect-error hook type removed temporarily
      await ctx.hooks.callHook('serve:before-route', req)
      return new Promise((resolve) => {
        // @ts-expect-error untyped
        sirv(serveArguments.dirname, serveArguments.sirvOptions)(req, res, resolve)
      })
    })

    registerRoute('get', `${serveArguments.path}**`, handle)
    registerRoute('get', withoutTrailingSlash(serveArguments.path), handle)
  })
}

export { serve }
