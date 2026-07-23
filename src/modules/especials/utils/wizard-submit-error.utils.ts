import { extractMessageFromApiBody } from '~/shared/utils/api-notification.utils'
import { getErrorMessage } from '~/shared/utils/get-error-message'

export type WizardSubmitFailureEntity = 'user' | 'company' | 'logo' | 'modules'

export type WizardSubmitErrorAlert = {
  title: string
  message: string
}

export type WizardSubmitErrorContext = {
  userEmail?: string | null
  companyEmail?: string | null
  companyDocument?: string | null
}

const pickTrimmedString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

const joinErrorsList = (errors: unknown): string | null => {
  if (!Array.isArray(errors) || errors.length === 0) return null

  const parts = errors
    .map((item) => {
      if (typeof item === 'string') return pickTrimmedString(item)
      if (item && typeof item === 'object') {
        const record = item as { message?: unknown, msg?: unknown, detail?: unknown }
        return pickTrimmedString(record.message)
          ?? pickTrimmedString(record.msg)
          ?? pickTrimmedString(record.detail)
      }
      return null
    })
    .filter((part): part is string => Boolean(part))

  if (!parts.length) return null
  return [...new Set(parts)].join('\n')
}

/** Mensaje completo del body del endpoint (sin acortar). */
export const extractCompleteWizardErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const record = error as {
      data?: unknown
      response?: { _data?: unknown }
      message?: unknown
    }

    const body = record.data ?? record.response?._data
    if (body && typeof body === 'object') {
      const joinedErrors = joinErrorsList((body as { errors?: unknown }).errors)
      if (joinedErrors) return joinedErrors

      const fromBody = extractMessageFromApiBody(body)
      if (fromBody) return fromBody

      const detail = pickTrimmedString((body as { detail?: unknown }).detail)
      if (detail) return detail
    }

    const fromMessage = pickTrimmedString(record.message)
    if (fromMessage) return fromMessage
  }

  return getErrorMessage(error, 'No se pudo completar la solicitud.')
}

const titleForEntity = (entity: WizardSubmitFailureEntity | null): string => {
  switch (entity) {
    case 'user':
      return 'Error en formulario de usuarios'
    case 'company':
      return 'Error en formulario de empresas'
    case 'logo':
      return 'Error en logo de la empresa'
    case 'modules':
      return 'Error en asignación de módulos'
    default:
      return 'Error en el registro'
  }
}

/**
 * Mantiene la referencia al paso/formulario que falló y muestra
 * la respuesta de error completa del endpoint.
 */
export const resolveWizardSubmitErrorAlert = (
  error: unknown,
  entity: WizardSubmitFailureEntity | null,
  _context?: WizardSubmitErrorContext,
): WizardSubmitErrorAlert => ({
  title: titleForEntity(entity),
  message: extractCompleteWizardErrorMessage(error),
})

export const wizardStepIndexForFailure = (
  entity: WizardSubmitFailureEntity | null,
): number | null => {
  if (entity === 'user') return 0
  if (entity === 'company') return 1
  if (entity === 'logo') return 3
  if (entity === 'modules') return 4
  return null
}
