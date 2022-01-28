import { createUnrouted } from 'unrouted'
import {ConfigPartial, useParams} from "@unrouted/core";
import {get} from "unrouted";

export default async (options : ConfigPartial = {}) => {
  const { setup, handle } = await createUnrouted({
    name: 'laravelApi',
    prefix: options.prefix ?? undefined,
    debug: true,
  })

  await setup(() => {
    get('/user/{id}', () => 'Hi ' + useParams<{ id: string }>().id)
  })

  return handle
}
