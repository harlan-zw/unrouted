import { join, resolve } from "path";
import { createUnrouted } from 'unrouted'
import {get, serve} from "unrouted";

const simpleServeApi = async () => {
  const { handle, setup } = await createUnrouted({
    name: 'simpleServeApi'
  })

  await setup(() => {
    get('/static/my-sub-api', 'hello')
    // serve static files
    serve('/static', resolve(join(__dirname, '..', 'demo')))
  })

  return handle
}

export default simpleServeApi
