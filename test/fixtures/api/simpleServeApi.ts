import { createUnrouted } from '../../../src'
import { join, resolve } from "path";

const simpleServeApi = () => {
    const { serve, get, handle } = createUnrouted()

    get('/static/my-sub-api', 'hello')
    // serve static files
    serve('/static', resolve(join(__dirname, '..', 'demo')))
    return handle
}

export default simpleServeApi
