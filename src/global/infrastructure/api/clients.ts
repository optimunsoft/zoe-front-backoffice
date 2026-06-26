import type { ApiPluginNuxtApp } from './types'
import { createApiClient } from './create-api-client'
import {
  resolveApiBackofficeBasePath,
  resolveApiCoreBasePath,
} from './resolve-api-path'

type PublicRuntimeConfig = {
  API_CORE_PATH?: string
  API_ACCOUNTING_PATH?: string
  API_BACKOFFICE_PATH?: string
  API_VERSION: string
  BACKEND_PATH_API?: string
}

function resolveCorePath(config: PublicRuntimeConfig): string {
  const configured 
    = config.API_CORE_PATH?.trim()
    || '/proxy/api-core'

  return resolveApiCoreBasePath(configured)
}



function resolveBackofficePath(config: PublicRuntimeConfig): string {
  const configured = config.API_BACKOFFICE_PATH?.trim() || '/proxy/api-backoffice'
  return resolveApiBackofficeBasePath(configured)
}

export function createApiClients(
  nuxtApp: ApiPluginNuxtApp,
  publicConfig: PublicRuntimeConfig,
) {
  const apiVersion = publicConfig.API_VERSION || 'v1'

  return {
    apiCore: createApiClient(nuxtApp, resolveCorePath(publicConfig), apiVersion),
    apiBackoffice: createApiClient(nuxtApp, resolveBackofficePath(publicConfig), apiVersion),
  }
}
