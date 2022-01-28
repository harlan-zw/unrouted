import testKit from '@unrouted/test-kit'
import type { RequestPathSchema } from '../api-routes'
import createApi from './fixtures/api/myApi'
import * as assertions from './assertions'

export async function bootstrap(app: any) {
  const api = await createApi({ debug: true })

  const request = testKit<RequestPathSchema>(app)
  app.use(api)


  Object.values(assertions)
    .forEach(assertion => assertion(request))
}
