import { $fetch } from 'ohmyfetch'
import type { FetchOptions } from 'ohmyfetch'
import type { TypedInternalGetResponse, TypedInternalPostResponse } from '../types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function $_fetchGlobal<R extends string, Default = unknown>(url: R, method: string, opts?: FetchOptions) {
  // @todo do something with Default
  // re-use global fetch instance if available
  return ((globalThis.$fetch || $fetch) as typeof $fetch)(url, {
    method,
    ...opts,
  })
}
//
export function $get<R extends string, Default = unknown>(url: R, opts?: FetchOptions): Promise<TypedInternalGetResponse<R, Default>> {
  return $_fetchGlobal<R, Default>(url, 'get', opts)
}
export function $post<R extends string, Default = unknown>(url: R, opts?: FetchOptions): Promise<TypedInternalPostResponse<R, Default>> {
  return $_fetchGlobal<R, Default>(url, 'post', opts)
}
export function $patch<R extends string, Default = unknown>(url: R, opts?: FetchOptions): Promise<TypedInternalGetResponse<R, Default>> {
  return $_fetchGlobal<R, Default>(url, 'patch', opts)
}
export function $put<R extends string, Default = unknown>(url: R, opts?: FetchOptions): Promise<TypedInternalGetResponse<R, Default>> {
  return $_fetchGlobal<R, Default>(url, 'put', opts)
}
export function $delete<R extends string, Default = unknown>(url: R, opts?: FetchOptions): Promise<TypedInternalGetResponse<R, Default>> {
  return $_fetchGlobal<R, Default>(url, 'delete', opts)
}
