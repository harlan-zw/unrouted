export type GetRequestPath = `/user/${string}` |
string

export type HeadRequestPath = `/user/${string}` |
string

export interface RequestPathSchema {
  get: GetRequestPath
  head: HeadRequestPath
}
