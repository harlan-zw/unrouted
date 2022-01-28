import createExpressApp from 'express'
import { describe } from 'vitest'
import { bootstrap } from './util'

describe('express provider', async() => {
  const app = createExpressApp()
  await bootstrap(app)
})
