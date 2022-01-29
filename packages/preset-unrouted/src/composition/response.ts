import { useResponse } from '@unrouted/core'

export function setStatusCode(code: number) {
  const res = useResponse()
  res.statusCode = code
}
