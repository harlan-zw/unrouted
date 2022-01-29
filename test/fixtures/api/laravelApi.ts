import { createUnrouted } from 'unrouted'
import {ConfigPartial, useParams} from "@unrouted/core";
import {get} from "unrouted";
import {join} from "path";

export default async (options : ConfigPartial = {}) => {
  const { setup, handle } = await createUnrouted({
    name: 'laravelApi',
    prefix: options.prefix ?? undefined,
    debug: true,
    dev: true,
    generateTypes: true,
    root: join(__dirname, '__routes__')
  })

  await setup(() => {
    get('/user/{id}', () => 'Hi ' + useParams<{ id: string }>().id)
  })

  return handle
}
