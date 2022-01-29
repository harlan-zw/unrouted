export type GetRequestPath = '/static/my-sub-api' |
`/static/${string}` |
'/static' |
string

export type HeadRequestPath = '/static/my-sub-api' |
string

export interface RequestPathSchema {
  get: GetRequestPath
  head: HeadRequestPath
}
