import { createApiClients } from './clients'
import type { ApiPluginNuxtApp } from './types'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  return {
    provide: createApiClients(nuxtApp as ApiPluginNuxtApp, config.public),
  }
})
