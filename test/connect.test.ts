import createConnectApp from 'connect'
import { describe } from 'vitest'
import { bootstrap } from './util'

describe('connect provider', async () => {
  const app = createConnectApp()
  await bootstrap(app)
})
