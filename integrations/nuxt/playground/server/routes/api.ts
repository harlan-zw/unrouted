import {del, get, group, middleware, post, prefix, redirect} from 'unrouted'
import {greeting as test, submitContactForm} from "../controllers/site";
import lazy from "../controllers/lazy";
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

  // redirects
  redirect('/old-url', '/new-url')
  // grouped routes
  group({
    prefix: '/modules',
    controller: import('../controllers/modules')
  }, () => {
    get('/', 'listModules')
    get('/:name', 'getModule')
  })
  /** Lazy API creation **/
  // alternative grouped routes async
  group({
    prefix: '/blog',
    controller: import('../controllers/blog')
  }, () => {
    get('/', 'getArticles')
    get('/:slug', 'getArticle')
    post('/', 'createArticle')
    post('/:slug', 'updateArticle')
    del('/:slug', 'deleteArticle')
  })
  // manual async routes
  group({
    prefix: '/lazy',
  }, () => {
    get('/', lazy)
  })
  // forms
  prefix('/contact', () => {
    // inline post
    post('/', submitContactForm)
  })
}
