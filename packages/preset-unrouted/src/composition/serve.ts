import type { ServerResponse } from 'http'
import type { Options } from 'sirv'
import sirv from 'sirv'
import { promisifyHandle } from 'h3'
import { withBase, withLeadingSlash, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import type { AbstractIncomingMessage, HookResult } from '@unrouted/core'
import { registerRoute, useUnrouted } from '@unrouted/core'
import defu from 'defu'

declare module '@unrouted/core' {
  interface UnroutedHooks {
    'serve:register': (serveArguments: ServeArguments) => HookResult
    'serve:before-route': (req: AbstractIncomingMessage) => HookResult
  }
}

interface ServeArguments {
  path: string
  dirname: string
  sirvOptions?: Options
}

/**
 * Serve static files from a directory using sirv.
 */
const serve = (path: string, dirname: string, sirvOptions: Options = {}) => {
  const ctx = useUnrouted()!

  sirvOptions = defu(sirvOptions, {
    single: true,
    dev: ctx.config.dev,
  })

  path = withBase(path, ctx.prefix)
  path = withTrailingSlash(withLeadingSlash(path))

  const serveArguments: ServeArguments = {
    path,
    dirname,
    sirvOptions,
  }

  // allow user to configure serve with a hook
  ctx.hooks.callHook('serve:register', serveArguments).then(() => {
    const handle = promisifyHandle((req: AbstractIncomingMessage, res: ServerResponse) => {
      // we need to strip the path from the req.url for sirv to work
      req.url = withTrailingSlash(req.url?.replace(serveArguments.path, '') || '/')
      ctx.hooks.callHook('serve:before-route', req).then(() => {
        sirv(serveArguments.dirname, serveArguments.sirvOptions)(req, res)
      })
    })

    registerRoute('GET', `${serveArguments.path}**`, handle)
    registerRoute('GET', withoutTrailingSlash(serveArguments.path), handle)
  })
}

export { serve }
