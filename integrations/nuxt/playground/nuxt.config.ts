import { defineNuxtConfig } from 'nuxt3'
import MyModule from '..'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  // experimentNitropack: true,
  unrouted: {
    debug: true,
  },
})
