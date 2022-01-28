import type stream from 'stream'
import type { SuperAgentRequest } from 'superagent'
import type { CallbackHandler } from 'supertest'

declare module 'superagent' {
  namespace request {
    interface SuperAgent<Req extends SuperAgentRequest> extends stream.Stream {
      get(url: string, callback?: CallbackHandler): Req
    }
  }
}
