import { describe } from 'vitest'
import { listen } from 'listhen'
import { toNodeListener } from 'h3'
import testKit from '../packages/test-kit/src'
import createApi from './fixtures/api/myApi'
import * as assertions from './assertions'

describe('h3 provider', async () => {
  const api = await createApi({ debug: true })

  const server = await listen(toNodeListener(api.app), {
    open: false,
  })
  const request = testKit<UnroutedApi>(server.server)

  Object.values(assertions)
    .forEach(assertion => assertion(request))
})
