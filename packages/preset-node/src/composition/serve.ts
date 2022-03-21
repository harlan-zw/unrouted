import type { IncomingMessage, ServerResponse } from 'http'
import type { Stats } from 'fs'
import sirv from 'sirv'
import { promisifyHandle } from 'h3'
import { withBase, withLeadingSlash, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import type { AbstractIncomingMessage } from '@unrouted/core'
import { registerRoute, useUnrouted } from '@unrouted/core'
import defu from 'defu'

/*
@todo fix, this is causing build issues
declare module '../unrouted' {
  interface UnroutedHooks {
    'serve:register': (serveArguments: ServeArguments) => HookResult
    'serve:before-route': (req: AbstractIncomingMessage) => HookResult
  }
} */
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
const serve = (path: string, dirname: string, sirvOptions: SirvOptions = {}) => {
  const ctx = useUnrouted()!

  sirvOptions = defu(sirvOptions, {
    single: true,
    dev: ctx.config.debug,
  })

  path = withBase(path, ctx.prefix)
  path = withTrailingSlash(withLeadingSlash(path))

  const serveArguments: ServeArguments = {
    path,
    dirname,
    sirvOptions,
  }

  // allow user to configure serve with a hook
  // @ts-expect-error hook type removed temporarily
  ctx.hooks.callHook('serve:register', serveArguments).then(() => {
    const handle = promisifyHandle((req: AbstractIncomingMessage, res: ServerResponse) => {
      // we need to strip the path from the req.url for sirv to work
      req.url = withTrailingSlash(req.url?.replace(serveArguments.path, '') || '/')
      // @ts-expect-error hook type removed temporarily
      ctx.hooks.callHook('serve:before-route', req).then(() => {
        sirv(serveArguments.dirname, serveArguments.sirvOptions)(req, res)
      })
    })

    registerRoute('GET', `${serveArguments.path}**`, handle)
    registerRoute('GET', withoutTrailingSlash(serveArguments.path), handle)
  })
}

export { serve }