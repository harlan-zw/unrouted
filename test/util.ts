import testKit from '@unrouted/test-kit'
import createApi from './fixtures/api/myApi'
import * as assertions from './assertions'
import type { RequestPathSchema } from './fixtures/api/__routes__/api-routes'

export async function bootstrap(app: any) {
  const api = await createApi({ debug: true })

  const request = testKit<RequestPathSchema>(app)
  app.use(api)

  Object.values(assertions)
    .forEach(assertion => assertion(request))
}
