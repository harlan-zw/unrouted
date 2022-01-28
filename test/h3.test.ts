import { createApp as createH3App } from 'h3'
import { describe } from 'vitest'
import { bootstrap } from './util'

describe('h3 provider', async() => {
  const app = createH3App({
    onError() {
      // do nothing
    },
  })
  await bootstrap(app)
})
