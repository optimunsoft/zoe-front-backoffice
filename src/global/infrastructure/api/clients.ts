import type { ApiPluginNuxtApp } from './types'
import { createApiClient } from './create-api-client'
import {
  resolveApiAccountingBasePath,
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
  const configured =
    config.API_CORE_PATH?.trim()
    || config.API_BACKOFFICE_PATH?.trim()
    || config.BACKEND_PATH_API?.trim()
    || '/proxy/api-core'

  return resolveApiCoreBasePath(configured)
}

function resolveAccountingPath(config: PublicRuntimeConfig): string {
  const configured = config.API_ACCOUNTING_PATH?.trim() || '/proxy/api-accounting'
  return resolveApiAccountingBasePath(configured)
}

export function createApiClients(
  nuxtApp: ApiPluginNuxtApp,
  publicConfig: PublicRuntimeConfig,
) {
  const apiVersion = publicConfig.API_VERSION || 'v1'

  return {
    apiCore: createApiClient(nuxtApp, resolveCorePath(publicConfig), apiVersion),
    apiAccounting: createApiClient(
      nuxtApp,
      resolveAccountingPath(publicConfig),
      apiVersion,
    ),
  }
}
