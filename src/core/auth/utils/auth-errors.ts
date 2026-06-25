import { getErrorMessage, getHttpStatus } from '~/shared/utils/get-error-message'

export { getHttpStatus }

export const AUTH_ERROR_MESSAGES = {
  invalidCredentials: 'Usuario o contraseña no válidos',
  loginFailed: 'No se pudo iniciar sesión',
  logoutFailed: 'No se pudo cerrar la sesión en el servidor',
} as const

function resolveAuthFlowError(
  error: unknown,
  fallback: string,
  options?: { invalidCredentialStatuses?: number[] },
): string {
  const status = getHttpStatus(error)

  if (options?.invalidCredentialStatuses?.includes(status ?? -1)) {
    return AUTH_ERROR_MESSAGES.invalidCredentials
  }

  return getErrorMessage(error, fallback)
}

export function resolveLoginError(error: unknown): string {
  return resolveAuthFlowError(error, AUTH_ERROR_MESSAGES.loginFailed, {
    invalidCredentialStatuses: [401, 403],
  })
}

export function resolveLogoutError(error: unknown): string {
  return getErrorMessage(error, AUTH_ERROR_MESSAGES.logoutFailed)
}
