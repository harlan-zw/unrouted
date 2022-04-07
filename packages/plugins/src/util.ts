import { generateTypes, resolveSchema } from 'untyped'

interface GenerateTypesOptions {
  interfaceName?: string
  addExport?: boolean
  addDefaults?: boolean
  defaultDescrption?: string
  indentation?: number
  allowExtraKeys?: boolean
}

export function untypePayload(payload: any, options?: GenerateTypesOptions) {
  if (typeof payload === 'string')
    return `'${payload}'|${typeof payload}`
  if (typeof payload === 'number')
    return `${payload}|${typeof payload}`
  return generateTypes(resolveSchema(payload), options)
}
