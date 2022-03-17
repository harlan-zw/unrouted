import { $fetch, FetchOptions} from 'ohmyfetch'
import {$get, $put, TypedInternalGetResponse} from '@unrouted/fetch'


export function useGet<R extends string, Default = unknown>(url: R, options = {}) {
  const fetch = useFetch(url, options)
  return {
    data: fetch.data as unknown as Promise<TypedInternalGetResponse<R, Default>>
  }
}

const res = await $put('/api/modules')
let modules = await $get('/api/modules')
