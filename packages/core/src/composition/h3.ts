import type {
  H3Error, HTTPMethod,
} from 'h3'
import {
  appendHeader as h3AppendHeader,
  assertMethod as h3AssertMethod,
  deleteCookie as h3DeleteCookie,
  isMethod as h3IsMethod,
  sendError as h3SendError,
  sendRedirect as h3SendRedirect,
  setCookie as h3SetCookie,
  parseCookies as h3UseCookie,
  getMethod as h3UseMethod,
  getQuery as h3UseQuery,
  readRawBody as h3UseRawBody,
} from 'h3'
import type { QueryObject } from 'ufo'
import { useEvent, useUnrouted } from '../unrouted'

type Nullable<T> = { [K in keyof T]: T[K] | undefined }

export function readRawBody(encoding?: false | 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'latin1' | 'binary' | 'hex') {
  return h3UseRawBody(useEvent(), encoding)
}

export function useQuery<T extends QueryObject>() {
  return h3UseQuery(useEvent()) as Nullable<T>
}

export function useMethod(defaultMethod?: HTTPMethod) {
  return h3UseMethod(useEvent(), defaultMethod)
}

export function useCookies() {
  return h3UseCookie(useEvent())
}

export function setCookie(name: string, value: string, serializeOptions?: any) {
  return h3SetCookie(useEvent(), name, value, serializeOptions)
}

export function sendRedirect(location: string, code?: number) {
  return h3SendRedirect(useEvent(), location, code)
}

export function sendError(error: Error | H3Error) {
  const { config } = useUnrouted()
  return h3SendError(useEvent(), error, config.debug)
}

export function appendHeader(name: string, value: string) {
  return h3AppendHeader(useEvent(), name, value)
}

export function getHeader(name: string) {
  return useEvent().req.headers[name]
}

export function assertMethod(expected: HTTPMethod | HTTPMethod[], allowHead?: boolean) {
  return h3AssertMethod(useEvent(), expected, allowHead)
}

export function isMethod(expected: HTTPMethod | HTTPMethod[], allowHead?: boolean) {
  return h3IsMethod(useEvent(), expected, allowHead)
}

// @todo import serializeOptions type from h3
export function deleteCookie(name: string, serializeOptions?: any) {
  return h3DeleteCookie(useEvent(), name, serializeOptions)
}
