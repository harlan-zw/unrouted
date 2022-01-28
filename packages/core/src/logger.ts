import consola from 'consola'

export const createLogger = (key: string, debug = false) => {
  const logger = consola.withScope(key)

  if (debug) {
    // debug
    logger.level = 4
  }
  return logger
}
