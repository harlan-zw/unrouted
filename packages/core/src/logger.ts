import consola from 'consola'

export const createLogger = (key = 'unrouted', debug = false) => {
  const logger = consola.withScope(key)
  if (debug) {
    // debug
    logger.level = 4
  }
  return logger
}
