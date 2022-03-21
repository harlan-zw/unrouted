import { join } from 'path'
import { describe, expect, test } from 'vitest'
import fse from 'fs-extra'
import { dirname } from 'pathe'
import { createUnrouted, get, post } from '@unrouted/core'
import { presetNode } from '../../packages/preset-node/src'
import { greeting } from '../fixtures/api/controllers/simple'
import { untypePayload } from '../../packages/plugins/src/util'

const dynamicPayload = {
  id: 3,
  title: 'hello',
  postedAt: '2022-10-2',
  description: 'this is a test',
}

describe('type generation works', async() => {
  const typesFile = join(dirname(__dirname), 'fixtures', 'api', '__routes__', 'types-test.d.ts')
  const config = {
    name: 'types-test',
    prefix: '/__api',
    presets: [
      presetNode({
        generateTypes: true,
        generateTypesPath: typesFile,
        watchRouteExportsPath: join(dirname(__dirname), 'fixtures', 'api', 'controllers'),
      }),
    ],
    hooks: {
      'setup:routes': function(routes) {
        for (const route of routes) {
          // need to manually add runtimeTypes so it's available
          if (route.path === '/__api/dynamic-type-return') {
            route.meta.runtimeTypes = untypePayload(dynamicPayload, {
              interfaceName: route.id,
              indentation: 2,
              addDefaults: false,
              addExport: false,
            })
          }
        }
      },
    },
  }
  const { setup } = await createUnrouted(config)

  test('basic anonymous route types', async() => {
    await setup(() => {
      post('post-test', () => {})
      get('/greeting', () => 'Hello :)')
      get('/greeting/:name', () => {})
    })

    const file = await fse.readFile(typesFile, 'utf-8')
    expect(file)
      .toMatchInlineSnapshot(`
        "// Generated by unrouted
        declare module '@unrouted/core' {
          type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T
          interface GetRoutes {
            '/__api/greeting': Awaited<ReturnType<any>>
            [key: \`/__api/greeting/\${string}\`]: Awaited<ReturnType<any>>
          }
          interface PostRoutes {
            '/__api/post-test': Awaited<ReturnType<any>>
          }
        }
        
        export {}
        "
      `)
  })

  test('named route types', async() => {
    const { setup } = await createUnrouted(config)
    await setup(() => {
      get('/greeting', greeting)
    })

    const file = await fse.readFile(typesFile, 'utf-8')
    expect(file).toMatchInlineSnapshot(`
      "// Generated by unrouted
      declare module '@unrouted/core' {
        type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T
        interface GetRoutes {
          '/__api/greeting': Awaited<ReturnType<any>>
        }
      }
      
      export {}
      "
    `)
  })

  test('route runtime types', async() => {
    const { setup } = await createUnrouted()
    await setup(() => {
      get('/dynamic-type-return', () => {
        return {
          id: 3,
          title: 'hello',
          postedAt: '2022-10-2',
          description: 'this is a test',
        }
      })
    })

    const file = await fse.readFile(typesFile, 'utf-8')
    expect(file).toMatchInlineSnapshot(`
      "// Generated by unrouted
      declare module '@unrouted/core' {
        type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T
        interface _1015972996 {
           id: number,
      
          title: string,
      
          postedAt: string,
      
          description: string,
        }
      
        interface GetRoutes {
          '/__api/dynamic-type-return': Awaited<_1015972996>
        }
      }
      
      export {}
      "
    `)
  })
})
