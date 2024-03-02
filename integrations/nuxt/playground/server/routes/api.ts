import { del, get, group, post, prefix, redirect } from 'unrouted'
import { submitContactForm, greeting as test } from '../controllers/site'
import lazy from '../controllers/lazy'

export default () => {
  /** Simple non-lazy API creation */
  get('/greeting', test)
  get('/greeting-2', () => 'welcome 2 :)')

  // redirects
  redirect('/old-url', '/new-url')
  // grouped routes
  group({
    prefix: '/modules',
    controller: import('../controllers/modules'),
  }, () => {
    get('/', 'listModules')
    get('/:name', 'getModule')
  })
  /** Lazy API creation */
  // alternative grouped routes async
  group({
    prefix: '/blog',
    controller: import('../controllers/blog'),
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
