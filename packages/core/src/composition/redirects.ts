import type { IncomingMessage, ServerResponse } from 'http'
import { promisifyHandle, sendRedirect } from 'h3'
import { registerRoute } from '../util'

export const redirect = (route: string, location: string, code?: 301|302|307|410|451) => {
  registerRoute('GET', route, promisifyHandle((req: IncomingMessage, res: ServerResponse) => sendRedirect(res, location, code)))
}

export const permanentRedirect = (route: string, location: string) => {
  registerRoute('GET', route, promisifyHandle((req: IncomingMessage, res: ServerResponse) => sendRedirect(res, location, 301)))
}
