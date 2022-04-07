import {del, get, group, post, prefix, redirect} from 'unrouted'
import {greeting as test, submitContactForm} from "../controllers/site";

export default () => {
  /** Simple non-lazy API creation **/
  get('/greeting', test)

  // redirects
  redirect('/old-url', '/new-url')
  //
  // // alternative grouped routes async
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

  // forms
  prefix('/contact', () => {
    // inline post
    post('/', submitContactForm)
  })
}
