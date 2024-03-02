import { $fetch } from 'ofetch'
import type { FetchOptions } from 'ofetch'
import type { DeleteRoutes, GetRoutes, OptionsRoutes, PatchRoutes, PostRoutes, PutRoutes } from '@unrouted/core'
import type { TypedInternalResponse } from '../types'

// eslint-disable-next-line unused-imports/no-unused-vars
async function $_fetchGlobal<R extends string, Default = unknown>(url: R, method: string, opts?: FetchOptions) {
  // @todo do something with Default
  // re-use global fetch instance if available
  return (((globalThis as any).$fetch || $fetch) as typeof $fetch)(url, {
    method,
    ...opts,
  })
}

export function $get<R extends string, Default = unknown>(url: R, opts?: FetchOptions): Promise<TypedInternalResponse<R, Default, GetRoutes>> {
  return $_fetchGlobal<R, Default>(url, 'get', opts)
}
export function $post<R extends string, Default = unknown>(url: R, opts?: FetchOptions): Promise<TypedInternalResponse<R, Default, PostRoutes>> {
  return $_fetchGlobal<R, Default>(url, 'post', opts)
}
export function $patch<R extends string, Default = unknown>(url: R, opts?: FetchOptions): Promise<TypedInternalResponse<R, Default, PutRoutes>> {
  return $_fetchGlobal<R, Default>(url, 'patch', opts)
}
export function $put<R extends string, Default = unknown>(url: R, opts?: FetchOptions): Promise<TypedInternalResponse<R, Default, PatchRoutes>> {
  return $_fetchGlobal<R, Default>(url, 'put', opts)
}
export function $delete<R extends string, Default = unknown>(url: R, opts?: FetchOptions): Promise<TypedInternalResponse<R, Default, DeleteRoutes>> {
  return $_fetchGlobal<R, Default>(url, 'delete', opts)
}
export function $options<R extends string, Default = unknown>(url: R, opts?: FetchOptions): Promise<TypedInternalResponse<R, Default, OptionsRoutes>> {
  return $_fetchGlobal<R, Default>(url, 'delete', opts)
}
