import { useResponse } from '../unrouted'

export function setStatusCode(code: number) {
  const res = useResponse()
  res.statusCode = code
}
