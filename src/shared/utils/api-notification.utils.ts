import type { FetchResponse } from 'ofetch'

import { resolveContextualSuccessMessage } from '~/shared/constants/api-notification-context'
import { HEADER_SKIP_NOTIFICATION } from '~/shared/constants/headers'
import { getRequestUrl, isAuthRefreshRequest } from '~/global/infrastructure/api/request-url'

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

const NOTIFICATION_ERROR_SILENT_PATHS = [
  'auth/refresh',
  'auth/logout',
]

const NOTIFICATION_SUCCESS_SILENT_PATHS = [
  ...NOTIFICATION_ERROR_SILENT_PATHS,
  'auth/login',
  'auth/admin/passwordless/start',
  'auth/admin/passwordless/verify',
  'users/me',
  // Acciones inline (spinner en el ítem); el feedback de éxito es el propio control.
  'companies/users/assign',
  'companies/users/unassign',
  '/status',
]

type ApiRequestOptions = {
  method?: string
  headers?: HeadersInit
}

type ApiEnvelope = {
  status?: boolean | number | string
  message?: unknown
  response?: unknown
  error?: unknown
  errors?: unknown
}

const getRequestMethod = (options: ApiRequestOptions) =>
  (options.method ?? 'GET').toUpperCase()

const hasSkipNotificationHeader = (options: ApiRequestOptions) => {
  const headers = new Headers(options.headers)
  return headers.get(HEADER_SKIP_NOTIFICATION) === '1'
}

const matchesPath = (requestUrl: string, paths: string[]) =>
  paths.some((path) => requestUrl.includes(path))

const getApiEnvelope = (data: unknown): ApiEnvelope | null => {
  if (!data || typeof data !== 'object') return null
  return data as ApiEnvelope
}

const pickTrimmedString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

/** Fallo de negocio con HTTP 2xx: `{ status: false, message, response }`. */
export const isApiBusinessFailure = (data: unknown): boolean => {
  const envelope = getApiEnvelope(data)
  if (!envelope || !('status' in envelope)) return false

  const { status } = envelope
  return status === false || status === 0 || status === 'false'
}

/**
 * Extrae siempre el `message` del body de la API cuando exista.
 * Ej: `{ status: false, message: "Unauthorized", response: null }`
 */
export const extractMessageFromApiBody = (data: unknown): string | null => {
  if (typeof data === 'string') {
    const asText = pickTrimmedString(data)
    if (asText) {
      try {
        return extractMessageFromApiBody(JSON.parse(asText))
      } catch {
        return asText
      }
    }
    return null
  }

  const envelope = getApiEnvelope(data)
  if (!envelope) return null

  const fromMessage = pickTrimmedString(envelope.message)
  if (fromMessage) return fromMessage

  const fromError = pickTrimmedString(envelope.error)
  if (fromError) return fromError

  const errors = envelope.errors
  if (Array.isArray(errors)) {
    const first = errors[0]
    if (typeof first === 'string') return pickTrimmedString(first)
    if (first && typeof first === 'object') {
      return pickTrimmedString((first as { message?: unknown }).message)
    }
  }

  return null
}

export const shouldSkipApiNotification = (
  request: unknown,
  options: ApiRequestOptions,
) => {
  if (hasSkipNotificationHeader(options)) return true
  return false
}

export const shouldShowApiSuccessNotification = (
  request: unknown,
  response: FetchResponse<unknown>,
  options: ApiRequestOptions,
) => {
  if (shouldSkipApiNotification(request, options)) return false
  if (response.status < 200 || response.status >= 300) return false
  if (isApiBusinessFailure(response._data)) return false
  if (!MUTATION_METHODS.has(getRequestMethod(options))) return false

  const requestUrl = getRequestUrl(request)
  if (matchesPath(requestUrl, NOTIFICATION_SUCCESS_SILENT_PATHS)) return false

  // Asignación/actualización inline de módulos a empresa (spinner en la fila).
  if (/\/modules\/[^/]+\/companies(?:\/|$|\?)/i.test(requestUrl)) return false

  return true
}

export const shouldShowApiErrorNotification = (
  request: unknown,
  response: FetchResponse<unknown>,
  options: ApiRequestOptions,
) => {
  if (shouldSkipApiNotification(request, options)) return false
  if (isAuthRefreshRequest(request)) return false

  const requestUrl = getRequestUrl(request)
  if (matchesPath(requestUrl, NOTIFICATION_ERROR_SILENT_PATHS)) return false

  return response.status >= 400 || isApiBusinessFailure(response._data)
}

export const extractApiErrorMessage = (
  _request: unknown,
  response: FetchResponse<unknown>,
) => {
  const fromBody = extractMessageFromApiBody(response._data)
  if (fromBody) return fromBody

  return `No se pudo completar la solicitud (${response.status})`
}

export const extractApiSuccessMessage = (
  request: unknown,
  _response: FetchResponse<unknown>,
  options: ApiRequestOptions,
  routePath?: string,
) => {
  const requestUrl = getRequestUrl(request)
  const contextualMessage = resolveContextualSuccessMessage(
    getRequestMethod(options),
    requestUrl,
    routePath,
  )

  if (contextualMessage) return contextualMessage

  const method = getRequestMethod(options)

  if (method === 'POST') return 'El registro se creó correctamente'
  if (method === 'PUT' || method === 'PATCH') return 'El registro se actualizó correctamente'
  if (method === 'DELETE') return 'El registro se eliminó correctamente'

  return null
}
