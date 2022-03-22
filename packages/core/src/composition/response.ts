import { useResponse } from '../unrouted'

export function setStatusCode(code: number) {
  const res = useResponse()
  res.statusCode = code
}

export function errorUnprocessableEntity(payload: any) {
  setStatusCode(422)
  return payload
}

export function errorNotFound(payload: any) {
  setStatusCode(404)
  return payload
}
