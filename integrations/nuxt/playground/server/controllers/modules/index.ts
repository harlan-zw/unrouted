import {getModules} from "../../../storage/modules";
import {NuxtModule} from "@nuxt/schema";
import {setStatusCode, useParams} from "unrouted";

export async function getModule() {
  const { name } = useParams<{ name: string }>()
  const modules = await getModules()
  const index = modules.findIndex(m => m?.name === name)
  if (!index) {
    setStatusCode(404)
    return
  }
  return modules[index]
}

export async function listModules(): Promise<NuxtModule[]> {
  return await getModules()
}
