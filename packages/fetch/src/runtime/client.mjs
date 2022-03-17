export function createResolve(fetch) {
  return (method) => {
    return function (url, opts) {
      return fetch(url, {
        method,
        ...opts,
      })
    }
  }
}

export function createUtils(fetch) {
  const resolve = createResolve(fetch)

  return {
    $get: resolve('get'),
    $post: resolve('post'),
  }
}
