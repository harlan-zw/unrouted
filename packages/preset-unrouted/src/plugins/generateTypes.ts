import { join } from 'path'
import type { HttpMethod, Route } from '@unrouted/core'
import { defineUnroutedPlugin } from '@unrouted/core'
import { outputFile } from 'fs-extra'

const ucFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export default defineUnroutedPlugin({
  meta: {
    name: 'generateTypes',
  },
  setup({ hooks }) {
    hooks.hook('setup:after', async({ config, routes }) => {
      const methodStack: Record<Exclude<HttpMethod, '*'>, Route[]> = {
        GET: [],
        HEAD: [],
        POST: [],
        PUT: [],
        DELETE: [],
        CONNECT: [],
        OPTIONS: [],
        TRACE: [],
      }
      let types = ''
      routes.forEach((route) => {
        let methods = route.method
        if (route.method[0] === '*')
          methods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE']

        methods.forEach((method) => {
          if (method !== '*')
            methodStack[method].push(route)
        })
      })
      const methodsUsing: Record<string, string> = {}
      // create types based on each method
      for (const m in methodStack) {
        const method = m as Exclude<HttpMethod, '*'>
        const requests = methodStack[method]
        if (requests.length === 0)
          continue
        const name = ucFirst(method.toLowerCase())
        const typeName = `${name}RequestPath`
        methodsUsing[method.toLowerCase()] = typeName
        types += `export type ${typeName} = `
        for (const request of methodStack[method]) {
          let path = request.path
          // match the named parma in the path
          if (path.match(/:(\w+)/) || path.endsWith('**')) {
            path = path
              // eslint-disable-next-line no-template-curly-in-string
              .replace(/:(\w+)/, '${string}')
              // eslint-disable-next-line no-template-curly-in-string
              .replace(/\*\*/, '${string}')
            types += `\`${path}\` |\n`
          }
          else {
            types += `'${path}' |\n`
          }
        }
        types = `${types.substring(0, types.length - 2)}|\nstring\n\n`
      }
      types += 'export interface RequestPathSchema {\n'
      for (const m in methodsUsing) {
        const typeName = methodsUsing[m]
        types += `  ${m}: ${typeName}\n`
      }
      types += '}\n'
      await outputFile(join(config.root, `${config.name ? `${config.name}-` : ''}routes.d.ts`), types, { encoding: 'utf-8' })
    })

    // Payload types @todo re-implement
    /*
  router.hooks.hook('request:payload', async({ route, payload }) => {
    const { config } = useUnrouted()!
    const p = typeof payload === 'string' ? { text: payload } : { body: payload }
    const types = generateTypes(resolveSchema({ [route.path]: p }), 'replacement')
      .replace(/export interface replacement {\n(.*)\n}/gms, '$1')

    await ensureFile(`${config.name}-payloads.d.ts`)
    let tds = await readFile(`${config.name}-payloads.d.ts`, { encoding: 'utf8' })

    if (!tds.includes('interface RequestPayloads'))
      tds += 'export interface RequestPayloads {\n\n}'

    // do replacement
    if (tds.includes(route.path))
      tds = tds.replace(new RegExp(`"${route.path}":.{.*?},.*?}.*?"\\/`, 'gms'), `${types}\n"/`)
    else
      tds = tds.replace(/export interface RequestPayloads {\n/gms, `export interface RequestPayloads {\n${types}\n`)

    await writeFile(`${config.name}-payloads.d.ts`, tds, { encoding: 'utf-8' })
    })
     */
  },
})
