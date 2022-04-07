import { errorNotFound, useParams} from "unrouted";
import {getModules} from "../../storage/modules";

export async function getModule() {
  const { name } = useParams<{ name: string }>()
  const modules = await getModules()
  const index = modules.findIndex(m => m?.name === name)
  if (!index) {
    errorNotFound({
      message: `No module found for name: ${name}.`
    })
    return
  }
  return modules[index]
}

export async function listModules() {
  return await getModules()
}
