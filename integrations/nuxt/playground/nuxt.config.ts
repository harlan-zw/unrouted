import { defineNuxtConfig } from 'nuxt3'
import MyModule from '..'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  unrouted: {
    prefix: '/__api',
    debug: true,
  },
})
