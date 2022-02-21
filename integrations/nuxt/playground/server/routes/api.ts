import {get, useQuery, post, useBody, group, del, useParams} from 'unrouted'
import { $fetch } from 'ohmyfetch'

interface NuxtModule {
  name: string
  description: string
}

export default async () => {
  const modules = await $fetch<NuxtModule[]>('https://cdn.jsdelivr.net/npm/@nuxt/modules@latest/modules.json')

  group('/modules', () => {
    post('/', () => {
      const module = useBody<NuxtModule>()
      modules.unshift(module)
      return module
    })
    del('/:name', () => {
      const { name } = useParams<{ name: string }>()
      const index = modules.findIndex(m => m?.name === name)
      delete modules[index]
      return {
        success: true,
        index,
      }
    })
    get('/:name', () => {
      const { name } = useParams<{ name: string }>()
      const index = modules.findIndex(m => m?.name === name)
      return modules[index]
    })
    get('/', () => {
      const { search } = useQuery<{ search: string }>()
      let res = modules
      if (search) {
        res = modules
          .filter(m => m.name.toLowerCase().includes(search) || m.description.toLowerCase().includes(search))
      }
      return res.filter(m => !!m)
    })
  })

}
