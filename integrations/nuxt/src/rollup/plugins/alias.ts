import MagicString from 'magic-string'
import type { Plugin } from 'rollup'

export default function alias(options: { routesDir: string }): Plugin {
  return {
    name: 'unrouted:alias-routes',
    transform(code, id) {
      if (!id.startsWith(options.routesDir))
        return null

      const s = new MagicString(code)
      s
        // replace #path@function -> import { function } from /some/path/to.ts
        .replace(/[`'"]#(\S*?)@(\S*)['"`]/gm, '() => import(\'../controllers/$1\').then(m => m.$2)')
      // replace #path -> import path from /some/path.ts
      // @todo
      // .replace(/[`'"]#(\S*?)['"`]/gm, '() => import(\'../controllers/$1\').then(m => m.default)')

      return {
        code: s.toString(),
        map: s.generateMap().toString(),
      }
    },
  }
}
