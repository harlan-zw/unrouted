import MagicString from 'magic-string'
import type { Plugin } from 'rollup'

export default function meta(options: { routesDir: string }): Plugin {
  return {
    name: 'unrouted:meta',
    transform(code, id) {
      if (!id.startsWith(options.routesDir))
        return null

      const s = new MagicString(code)
      s.append(`\nexport const __importMetaUrl = '${id}'\n`)
      return {
        code: s.toString(),
        map: s.generateMap().toString(),
      }
    },
  }
}
