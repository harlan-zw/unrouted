import type {
  H3Error,
} from 'h3'
import {
  appendHeader as h3AppendHeader,
  assertMethod as h3AssertMethod,
  deleteCookie as h3DeleteCookie,
  isMethod as h3IsMethod,
  sendError as h3SendError,
  sendRedirect as h3SendRedirect,
  setCookie as h3SetCookie,
  useCookie as h3UseCookie,
  useCookies as h3UseCookies,
  useMethod as h3UseMethod,
  useQuery as h3UseQuery,
  useRawBody as h3UseRawBody,
} from 'h3'
import type { QueryObject } from 'ufo'
import type { HTTPMethod } from '../types'
import { useRequest, useResponse, useUnrouted } from '../unrouted'

type Nullable<T> = { [K in keyof T]: T[K] | undefined }

export function useRawBody(encoding?: false | 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'latin1' | 'binary' | 'hex') {
  return h3UseRawBody(useRequest(), encoding)
}

export function useQuery<T extends QueryObject>() {
  return h3UseQuery(useRequest()) as Nullable<T>
}

export function useMethod(defaultMethod?: HTTPMethod) {
  return h3UseMethod(useRequest(), defaultMethod)
}

export function useCookies() {
  return h3UseCookies(useRequest())
}

export function useCookie(name: string) {
  return h3UseCookie(useRequest(), name)
}

export function setCookie(name: string, value: string, serializeOptions?: any) {
  return h3SetCookie(useResponse(), name, value, serializeOptions)
}

export function sendRedirect(location: string, code?: number) {
  return h3SendRedirect(useResponse(), location, code)
}

export function sendError(error: Error | H3Error) {
  const { config } = useUnrouted()
  return h3SendError(useResponse(), error, config.debug)
}

export function appendHeader(name: string, value: string) {
  return h3AppendHeader(useResponse(), name, value)
}

export function getHeader(name: string) {
  return useResponse().getHeader(name)
}

export function assertMethod(expected: HTTPMethod | HTTPMethod[], allowHead?: boolean) {
  return h3AssertMethod(useRequest(), expected, allowHead)
}

export function isMethod(expected: HTTPMethod | HTTPMethod[], allowHead?: boolean) {
  return h3IsMethod(useRequest(), expected, allowHead)
}

// @todo import serializeOptions type from h3
export function deleteCookie(name: string, serializeOptions?: any) {
  return h3DeleteCookie(useResponse(), name, serializeOptions)
}
