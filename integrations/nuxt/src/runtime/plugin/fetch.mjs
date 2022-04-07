import * as fns from '@unrouted/fetch'

for(const m in fns) {
  if (!globalThis[m]) {
    globalThis[m] = fns[m]
  }
}

export default () => {}
