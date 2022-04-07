import { defu } from 'defu'
import type { EventHandler } from 'h3'
import { useUnrouted } from '../unrouted'
import type { GroupAttributes } from '../types'

const group = (attributes: GroupAttributes, cb: (() => void)) => {
  const ctx = useUnrouted()!
  // handle controllers
  if (attributes.controller)
    attributes.routeMeta = defu({ resolve: { module: attributes.controller } }, attributes?.routeMeta || {})
  // add group stack
  ctx.groupStack.push(attributes)
  // call group function
  cb()
  // reset group stack
  ctx.groupStack.pop()
}

const middleware = (middleware: EventHandler[], cb: (() => void)) => {
  if (!Array.isArray(middleware))
    middleware = [middleware]
  return group({ routeMeta: { middleware } }, cb)
}

const prefix = (prefix: string, cb: (() => void)) => {
  return group({ prefix }, cb)
}

export { group, middleware, prefix }
