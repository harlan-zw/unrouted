import { useUnrouted } from '../unrouted'

const group = (prefix: string, cb: (() => void)) => {
  const ctx = useUnrouted()!

  const currentPrefix = ctx.prefix
  // avoid duplicate slashes
  if (currentPrefix.endsWith('/') && prefix.startsWith('/'))
    prefix = prefix.substring(1)

  // append prefix
  ctx.prefix = currentPrefix + prefix
  cb()
  // reset prefix
  ctx.prefix = currentPrefix
}

export { group }
