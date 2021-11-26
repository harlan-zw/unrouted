import { ServerResponse } from 'http'
import sirv from 'sirv'
import { promisifyHandle } from 'h3'
import { withBase, withLeadingSlash, withoutTrailingSlash, withTrailingSlash } from 'ufo'
import { AbstractIncomingMessage, UnroutedPlugin } from '../types'

export const serve: UnroutedPlugin = (router) => {
  router.serve = (path: string, dirname: string) => {
    path = withBase(path, router.prefix)
    path = withTrailingSlash(withLeadingSlash(path))
    router.hooks.callHook('serve:register', path, dirname)
    const handle = promisifyHandle((req: AbstractIncomingMessage, res: ServerResponse) => {
      // we need to strip the path from the req.url for sirv to work
      req.url = withTrailingSlash(req.url?.replace(path, '') || '/')
      router.hooks.callHook(`serve:before-route:${req.url}`)

      sirv(dirname, {
        single: true,
        dev: true,
      })(req, res)
    })
    router.use('GET', `${path}**`, handle)
    router.use('GET', withoutTrailingSlash(path), handle)
    return router
  }
}
