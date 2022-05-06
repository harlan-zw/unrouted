import { createContext } from 'unctx'
import type { CompatibilityEvent, CompatibilityEventHandler } from 'h3'
import { createApp, createRouter, sendError, useBody as useBodyH3 } from 'h3'
import { createHooks } from 'hookable'
import type {
  ConfigPartial,
  Nullable,
  UnroutedContext,
  UnroutedHooks,
} from './types'
import { createLogger } from './logger'
import { resolveConfig } from './config'
import { useMethod } from './composition'

const eventCtx = createContext<CompatibilityEvent>()
const unroutedCtx = createContext<UnroutedContext>()

export const useEvent = eventCtx.use as () => CompatibilityEvent
export const useUnrouted = unroutedCtx.use as () => UnroutedContext

const paramCtx = createContext()
const bodyCtx = createContext()
export const useParams: <T>() => T = paramCtx.use
export const useBody: <T>() => Nullable<T> = bodyCtx.use

export async function createUnrouted(config: ConfigPartial = {}): Promise<UnroutedContext> {
  const existingCtx = unroutedCtx.use()
  if (existingCtx) {
    existingCtx.logger.debug('Not creating new unrouted instance, we already have an instance.')
    return existingCtx
  }

  const resolvedConfig = await resolveConfig(config)

  const logger = createLogger(resolvedConfig.name, resolvedConfig.debug)

  logger.debug(`Creating new Unrouted ctx: \`${resolvedConfig.name}\``, resolvedConfig)

  // setup hooks
  const hooks = createHooks<UnroutedHooks>()
  if (config.hooks)
    hooks?.addHooks(config.hooks)

  // add params to global context
  hooks.hook('request:handle:before', async (e) => {
    eventCtx.set(e, true)
    const hasBody = ['PATCH', 'POST', 'PUT', 'DELETE'].includes(useMethod())
    let body = null
    if (hasBody)
      body = await useBodyH3(e)
    bodyCtx.set(body || {}, true)
    paramCtx.set(e.context?.params || {}, true)
  })

  const app = config.app || createApp({
    async onError(err, event) {
      // handle 404's
      // @ts-expect-error missing type
      if (err.statusCode === 404)
        await hooks.callHook('request:error:404', event)
      await sendError(event, err, !!config.debug)
    },
  })

  const groupStack = []
  if (resolvedConfig.prefix)
    groupStack.push({ prefix: resolvedConfig.prefix })

  // @ts-expect-error Ctx is not available for extra functions
  const ctx: UnroutedContext = {
    app,
    hooks,
    logger,
    router: createRouter(),
    config: resolvedConfig,
    routes: [],
    groupStack,
  }

  ctx.setup = async (fn) => {
    // clear old routes
    ctx.routes = []
    await ctx.hooks.callHook('setup:before', ctx)
    if (fn)
      await unroutedCtx.call(ctx, fn)
    await ctx.hooks.callHook('setup:routes', ctx.routes)
    logger.debug(`Setting up ${ctx.routes.length} routes.`)
    ctx.routes.forEach((route) => {
      // register them with our radix3 router
      route.method.forEach((m) => {
        ctx.router.add(route.path, route.handle as CompatibilityEventHandler, m)
      })
    })
    await ctx.hooks.callHook('setup:after', ctx)

    if (typeof app.use === 'function')
      app.use(ctx.router)
  }

  for (const preset of ctx.config.presets) {
    await preset.setup(ctx)
    logger.debug(`Using preset: \`${preset.meta.name}\`@\`${preset.meta.version}\``)
  }
  for (const plugin of ctx.config.plugins) {
    await plugin.setup(ctx)
    logger.debug(`Using plugin: \`${plugin.meta.name}\`${plugin.meta?.version ? `@\`${plugin.meta.version}\`` : ''}`)
  }

  for (const middleware of ctx.config.middleware) {
    if (typeof app.use === 'function')
      app?.use(middleware)
  }

  unroutedCtx.set(ctx)

  return ctx
}
