import { eventHandler, sendRedirect } from 'h3'
import { registerRoute } from '../util'

export function redirect(route: string, location: string, code?: 301 | 302 | 307 | 410 | 451) {
  registerRoute('get', route, eventHandler(e => sendRedirect(e, location, code)))
}

export function permanentRedirect(route: string, location: string) {
  registerRoute('get', route, eventHandler(e => sendRedirect(e, location, 301)))
}
