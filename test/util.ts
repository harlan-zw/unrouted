import testKit from '@unrouted/test-kit'
import { toNodeListener } from 'h3'
import createApi from './fixtures/api/myApi'
import * as assertions from './assertions'
import type { UnroutedApi } from './fixtures/api/__routes__/api-routes'

export async function bootstrap(app?: any) {
  const api = await createApi({ debug: true })

  const request = testKit<UnroutedApi>(!app ? api.app : app)
  if (app)
    app.use(toNodeListener(api.app))

  Object.values(assertions)
    .forEach(assertion => assertion(request))
}
