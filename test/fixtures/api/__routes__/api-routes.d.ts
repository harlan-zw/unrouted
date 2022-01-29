export type GetRequestPath = '/greeting' |
`/greeting/${string}` |
'/names' |
'/old-link' |
'/older-link' |
'/new-link' |
'/new-permalink' |
'/blog/articles' |
`/blog/articles/${string}` |
'/any-route' |
`/static/${string}` |
'/static' |
string

export type HeadRequestPath = '/greeting' |
`/greeting/${string}` |
'/names' |
'/new-link' |
'/new-permalink' |
'/blog/articles' |
`/blog/articles/${string}` |
'/any-route' |
string

export type PostRequestPath = '/post-test' |
'/names' |
'/blog/articles' |
`/blog/articles/${string}` |
'/any-route' |
string

export type PutRequestPath = `/blog/articles/${string}` |
'/any-route' |
string

export type DeleteRequestPath = `/blog/articles/${string}` |
'/any-route' |
string

export type ConnectRequestPath = '/any-route' |
string

export type OptionsRequestPath = '/any-route' |
string

export type TraceRequestPath = '/any-route' |
string

export interface RequestPathSchema {
  get: GetRequestPath
  head: HeadRequestPath
  post: PostRequestPath
  put: PutRequestPath
  delete: DeleteRequestPath
  connect: ConnectRequestPath
  options: OptionsRequestPath
  trace: TraceRequestPath
}
