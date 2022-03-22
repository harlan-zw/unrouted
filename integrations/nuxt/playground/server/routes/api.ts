import {get, middleware, post, prefix, redirect, version} from 'unrouted'
import { listModules, getModule } from "../controllers/modules";
import { greeting as test } from "../controllers/site";
import def from "../controllers/default";
import { throttleRequests } from '@unrouted/preset-api'

export default () => {
  prefix('/rate-limited', () => {
    middleware([
      throttleRequests({
        limit: 50,
        time: 10
      })
    ], () => {
      get('/expensive-request', () => 'hi')
    })
  })

  /** Simple non-lazy API creation **/
  get('/greeting', test)
  get('/greeting-2', () =>'welcome 2 :)')
  get('/default2', def)

  // redirects
  redirect('/old-url', '/new-url')
  // grouped routes
  prefix('/modules', () => {
    get('/', listModules)
    get('/:name', getModule)
  })
  /** Lazy API creation **/
  // alternative grouped routes async
  prefix('/blog', () => {
    get('/', '#blog@getArticles')
    get('/:slug', '#blog@getArticle')
  })
  // manual async routes
  get('/lazy', '#lazy')
  // forms
  prefix('/contact', () => {
    // inline post
    post('/', '#site@submitContactForm')
  })
}
