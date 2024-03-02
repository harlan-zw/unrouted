import type { CallbackHandler, Test } from 'supertest'
import supertest from 'supertest'

export type RouteSchema = Record<'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options' | 'connect' | 'trace', string>

export interface RequestTester<T extends Partial<RouteSchema> = Record<string, any>, Req = Test> {
  get: (url: T['get'], callback?: CallbackHandler) => Req
  put: (url: T['put'], callback?: CallbackHandler) => Req
  post: (url: T['post'], callback?: CallbackHandler) => Req
  patch: (url: T['patch'], callback?: CallbackHandler) => Req
  del: (url: T['delete'], callback?: CallbackHandler) => Req
  delete: (url: T['delete'], callback?: CallbackHandler) => Req
  head: (url: T['head'], callback?: CallbackHandler) => Req
  options: (url: T['options'], callback?: CallbackHandler) => Req
  connect: (url: T['connect'], callback?: CallbackHandler) => Req
  trace: (url: T['trace'], callback?: CallbackHandler) => Req
}

export default function<T extends Partial<RouteSchema>>(app: any) {
  return supertest(app)
}
