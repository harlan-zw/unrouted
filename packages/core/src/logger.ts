export const createLogger = async(key = 'unrouted', debug = false) => {
  try {
    const consola = (await import('consola')).default
    const logger = consola.withScope(key)
    if (debug) {
      // debug
      logger.level = 4
    }
    return logger
  }
  catch (e) {
    // no consola available, use console
  }
  if (debug)
    return console

  // fake logger
  return {
    debug() {},
    success() {},
    log() {},
    trace() {},
  }
}
