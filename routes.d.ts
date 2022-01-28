import type * as superagent from 'superagent'
import type { CallbackHandler } from 'supertest'

declare module 'supertest' {
  namespace supertest {
    interface SuperTest<T extends superagent.SuperAgentRequest> extends superagent.SuperAgent<T>{
      get(url: '/greeting', callback?: CallbackHandler): T
    }
  }
}
