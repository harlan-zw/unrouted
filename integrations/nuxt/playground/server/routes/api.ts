import { get, group, post, redirect} from 'unrouted'
import { listModules, getModule } from "../controllers/modules";
import { greeting as test } from "../controllers/site";
import def from "../controllers/default";

export default () => {
  /** Simple non-lazy API creation **/
  get('/greeting', test)
  get('/greeting-2', () =>'welcome 2 :)')
  get('/default2', def)

  // redirects
  redirect('/old-url', '/new-url')
  // grouped routes
  group('/modules', () => {
    get('/', listModules)
    get('/:name', getModule)
  })
  /** Lazy API creation **/
  // alternative grouped routes async
  group('/blog', () => {
    get('/', '#blog@getArticles')
    get('/:slug', '#blog@getArticle')
  })
  // manual async routes
  get('/lazy', '#lazy')
  // forms
  group('/contact', () => {
    // inline post
    post('/', '#site@submitContactForm')
  })
}
