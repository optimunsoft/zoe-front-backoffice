import { getErrorMessage } from '~/shared/utils/get-error-message'

export type WizardSubmitFailureEntity = 'user' | 'company' | 'logo' | 'modules'

export type WizardSubmitErrorAlert = {
  title: string
  message: string
}

type AmbiguousField =
  | 'email'
  | 'document'
  | 'phone'
  | 'username'
  | 'municipality'
  | 'name'
  | 'businessName'
  | 'address'

export type WizardSubmitErrorContext = {
  userEmail?: string | null
  companyEmail?: string | null
  companyDocument?: string | null
}

const normalizeMessage = (message: string) =>
  message
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

const isConflictTone = (message: string) =>
  message.includes('exist')
  || message.includes('registr')
  || message.includes('duplic')
  || message.includes('en uso')
  || message.includes('ya esta')
  || message.includes('already')
  || message.includes('unique')
  || message.includes('taken')

const FIELD_MATCHERS: Array<{ field: AmbiguousField, test: (message: string) => boolean }> = [
  {
    field: 'email',
    test: (message) => message.includes('email') || message.includes('correo'),
  },
  {
    field: 'document',
    test: (message) =>
      message.includes('nit')
      || message.includes('documento')
      || message.includes('document number')
      || message.includes('documentnumber')
      || message.includes('identificacion')
      || message.includes('cedula'),
  },
  {
    field: 'phone',
    test: (message) =>
      message.includes('telefono')
      || message.includes('celular')
      || message.includes('phone')
      || message.includes('movil'),
  },
  {
    field: 'username',
    test: (message) =>
      message.includes('username')
      || message.includes('nombre de usuario')
      || message.includes('user name'),
  },
  {
    field: 'municipality',
    test: (message) =>
      message.includes('municipio')
      || message.includes('municipality')
      || message.includes('ciudad'),
  },
  {
    field: 'businessName',
    test: (message) =>
      message.includes('razon social')
      || message.includes('business name')
      || message.includes('businessname')
      || message.includes('nombre comercial')
      || message.includes('trade name'),
  },
  {
    field: 'address',
    test: (message) => message.includes('direccion') || message.includes('address'),
  },
  {
    field: 'name',
    test: (message) =>
      message.includes('apellido')
      || message.includes('first name')
      || message.includes('lastname')
      || message.includes('last name')
      || message.includes('primer nombre')
      || message.includes('segundo nombre')
      || (message.includes('nombre') && !message.includes('usuario') && !message.includes('contador')),
  },
]

const detectAmbiguousField = (message: string): AmbiguousField | null => {
  for (const matcher of FIELD_MATCHERS) {
    if (matcher.test(message)) return matcher.field
  }
  return null
}

const FIELD_SHORT_LABEL: Record<AmbiguousField, { user: string, company: string }> = {
  email: { user: 'Correo de usuario ya existe', company: 'Correo de empresa ya existe' },
  document: { user: 'Documento de usuario ya existe', company: 'NIT de empresa ya existe' },
  phone: { user: 'Celular de usuario ya existe', company: 'Teléfono de empresa ya existe' },
  username: { user: 'Usuario ya existe', company: 'Usuario ya existe' },
  municipality: { user: 'Municipio de usuario', company: 'Municipio de empresa' },
  name: { user: 'Nombre de usuario', company: 'Nombre de empresa' },
  businessName: { user: 'Razón social ya existe', company: 'Razón social de empresa ya existe' },
  address: { user: 'Dirección de usuario', company: 'Dirección de empresa' },
}

export const resolveWizardSubmitErrorAlert = (
  error: unknown,
  entity: WizardSubmitFailureEntity | null,
  _context?: WizardSubmitErrorContext,
): WizardSubmitErrorAlert => {
  const apiMessage = getErrorMessage(error, '')
  const normalized = normalizeMessage(apiMessage)
  const field = normalized ? detectAmbiguousField(normalized) : null
  const scope = entity === 'user' || entity === 'company' ? entity : null

  if (scope && field) {
    const label = FIELD_SHORT_LABEL[field][scope]
    const title = isConflictTone(normalized) || field === 'email' || field === 'document'
      ? label
      : label.replace(/ ya existe$/, '')

    return {
      title,
      message: '',
    }
  }

  if (scope) {
    return {
      title: scope === 'user' ? 'Error de usuario' : 'Error de empresa',
      message: '',
    }
  }

  if (entity === 'logo') return { title: 'Error de logo', message: '' }
  if (entity === 'modules') return { title: 'Error de módulos', message: '' }

  return {
    title: 'Error en el registro',
    message: apiMessage || '',
  }
}

export const wizardStepIndexForFailure = (
  entity: WizardSubmitFailureEntity | null,
): number | null => {
  if (entity === 'user') return 0
  if (entity === 'company') return 1
  if (entity === 'logo') return 3
  if (entity === 'modules') return 4
  return null
}
