import { $fetch } from 'ohmyfetch'
import {NuxtModule} from "@nuxt/schema";

const ModulesKey = 'app.modules'

import { createStorage } from 'unstorage';

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
