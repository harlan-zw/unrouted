import { $fetch } from 'ohmyfetch'
import type { NuxtModule } from '@nuxt/schema'

import { createStorage } from 'unstorage'

const ModulesKey = 'app.modules'

const moduleStorage = createStorage()

export async function getModules(): Promise<NuxtModule[]> {
  if (!await moduleStorage.hasItem(ModulesKey)) {
    const modules = await $fetch('https://cdn.jsdelivr.net/npm/@nuxt/modules@latest/modules.json')
    await moduleStorage.setItem(ModulesKey, modules)
    return modules
  }
  return (await moduleStorage.getItem(ModulesKey)) as NuxtModule[]
}

export async function setModules(modules: NuxtModule[]) {
  await moduleStorage.setItem(ModulesKey, modules)
}
