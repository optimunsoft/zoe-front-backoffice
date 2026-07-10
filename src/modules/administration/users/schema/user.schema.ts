import { z } from 'zod'

import {
  resolveDefaultPhonePrefix,
  resolvePhonePrefixOption,
} from '~/core/ubication/utils/phone.utils'
import { isPasswordValid } from '~/shared/utils/password.utils'
import { BACKOFFICE_ROLE, USER_TYPE, type UserCreate, type UserList, type UserUpdate } from '../types/users.types'
import { resolveUserAccountDemo } from '../utils/user-account.utils'

const NAME_REGEX = /^[\p{L}\s'.-]+$/u
const USERNAME_REGEX = /^[a-zA-Z0-9_.@-]+$/
const PHONE_REGEX = /^\d{7,15}$/

export const sanitizeUserName = (value: string) =>
  value.replace(/[^\p{L}\s'.-]/gu, '')

export const sanitizeUsername = (value: string) =>
  value.replace(/[^a-zA-Z0-9_.@-]/g, '').slice(0, 50)

export const sanitizePhoneNumber = (value: unknown) =>
  String(value ?? '').replace(/\D/g, '').slice(0, 15)

const birthDateValue = z.union([
  z.string(),
  z.date(),
]).nullable()

const userFormFieldsSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'El nombre no puede superar 100 caracteres.')
    .regex(NAME_REGEX, 'El nombre solo puede contener letras.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'El apellido es obligatorio.')
    .max(100, 'El apellido no puede superar 100 caracteres.')
    .regex(NAME_REGEX, 'El apellido solo puede contener letras.'),
  username: z.string(),
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio.')
    .email('Ingresa un email válido.'),
  municipalityId: z
    .string()
    .trim()
    .min(1, 'Selecciona el municipio.'),
  birthDate: birthDateValue,
  phonePrefix: z
    .string()
    .trim()
    .min(1, 'Selecciona el prefijo telefónico.'),
  phoneNumber: z
    .string()
    .trim()
    .min(1, 'El teléfono es obligatorio.')
    .regex(PHONE_REGEX, 'El teléfono debe contener solo números (7 a 15 dígitos).'),
  backofficeRole: z
    .string()
    .trim()
    .max(100, 'El rol no puede superar 100 caracteres.'),
  isVerified: z.boolean(),
  isAdmin: z.boolean(),
  isDemo: z.boolean(),
  password: z.string(),
  userType: z.string(),
})

export type UserFormValues = z.input<typeof userFormFieldsSchema>

export type UserFormErrors = Record<
  | 'firstName'
  | 'lastName'
  | 'username'
  | 'email'
  | 'municipalityId'
  | 'birthDate'
  | 'phonePrefix'
  | 'phoneNumber'
  | 'backofficeRole'
  | 'password'
  | 'userType',
  string
>

export const emptyUserFormValues = (): UserFormValues => ({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  municipalityId: '',
  birthDate: null,
  phonePrefix: resolveDefaultPhonePrefix([]),
  phoneNumber: '',
  backofficeRole: '',
  isVerified: false,
  isAdmin: false,
  isDemo: false,
  password: '',
  userType: USER_TYPE.USUARIO,
})

export const emptyUserFormErrors = (): UserFormErrors => ({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  municipalityId: '',
  birthDate: '',
  phonePrefix: '',
  phoneNumber: '',
  backofficeRole: '',
  password: '',
  userType: '',
})

const parseDmyDate = (value: string): Date | null => {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null
  }

  return date
}

const parseBirthDate = (value: string | Date | null) => {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10)
  }

  const fromDmy = parseDmyDate(value)
  if (fromDmy) {
    return fromDmy.toISOString().slice(0, 10)
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toISOString().slice(0, 10)
}

const validateBirthDate = (value: string | Date | null, ctx: z.RefinementCtx) => {
  if (!value) {
    ctx.addIssue({
      code: 'custom',
      message: 'La fecha de nacimiento es obligatoria.',
      path: ['birthDate'],
    })
    return
  }

  if (!parseBirthDate(value)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Ingresa una fecha de nacimiento válida.',
      path: ['birthDate'],
    })
  }
}

const validatePassword = (
  password: string,
  mode: 'create' | 'edit',
  ctx: z.RefinementCtx,
) => {
  if (mode === 'create' && !password.trim()) {
    ctx.addIssue({
      code: 'custom',
      message: 'La contraseña es obligatoria.',
      path: ['password'],
    })
    return
  }

  if (!password.trim()) return

  if (!isPasswordValid(password)) {
    ctx.addIssue({
      code: 'custom',
      message: 'La contraseña no cumple los requisitos de seguridad.',
      path: ['password'],
    })
  }
}

const validateUserType = (userType: string, mode: 'create' | 'edit', ctx: z.RefinementCtx) => {
  if (mode !== 'create') return

  if (userType.trim() !== USER_TYPE.USUARIO) {
    ctx.addIssue({
      code: 'custom',
      message: 'El tipo de usuario no es válido.',
      path: ['userType'],
    })
  }
}

const validateUsername = (
  username: string,
  mode: 'create' | 'edit',
  ctx: z.RefinementCtx,
) => {
  if (mode === 'create') return

  const normalized = username.trim()
  if (!normalized) return

  if (normalized.length > 50) {
    ctx.addIssue({
      code: 'custom',
      message: 'El nombre de usuario no puede superar 50 caracteres.',
      path: ['username'],
    })
    return
  }

  if (!USERNAME_REGEX.test(normalized)) {
    ctx.addIssue({
      code: 'custom',
      message: 'El nombre de usuario contiene caracteres no permitidos.',
      path: ['username'],
    })
  }
}

const validateBackofficeRole = (values: UserFormValues, ctx: z.RefinementCtx) => {
  if (!values.isAdmin) return

  const role = values.backofficeRole.trim()
  if (!role) {
    ctx.addIssue({
      code: 'custom',
      message: 'Selecciona un rol de backoffice.',
      path: ['backofficeRole'],
    })
    return
  }

  if (!Object.values(BACKOFFICE_ROLE).includes(role as typeof BACKOFFICE_ROLE[keyof typeof BACKOFFICE_ROLE])) {
    ctx.addIssue({
      code: 'custom',
      message: 'Selecciona un rol de backoffice válido.',
      path: ['backofficeRole'],
    })
  }
}

const mapUserFormErrors = (error: z.ZodError): UserFormErrors => {
  const errors = emptyUserFormErrors()

  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key !== 'string' || !(key in errors)) continue
    if (!errors[key as keyof UserFormErrors]) {
      errors[key as keyof UserFormErrors] = issue.message
    }
  }

  return errors
}

export const validateUserForm = (
  values: UserFormValues,
  mode: 'create' | 'edit',
): UserFormErrors => {
  const result = userFormFieldsSchema.superRefine((data, ctx) => {
    validateBirthDate(data.birthDate, ctx)
    validatePassword(data.password, mode, ctx)
    validateUserType(data.userType, mode, ctx)
    validateUsername(data.username, mode, ctx)
    validateBackofficeRole(data, ctx)
  }).safeParse(values)

  if (result.success) return emptyUserFormErrors()
  return mapUserFormErrors(result.error)
}

const buildUserBasePayload = (values: UserFormValues) => {
  const birthDate = parseBirthDate(values.birthDate)
  if (!birthDate) {
    throw new Error('Invalid birth date')
  }

  const isAdmin = values.isAdmin
  const backofficeRole = isAdmin ? values.backofficeRole.trim() : ''

  return {
    email: values.email.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    municipalityId: values.municipalityId.trim(),
    birthDate,
    phonePrefix: values.phonePrefix.trim(),
    phoneNumber: values.phoneNumber.trim(),
    ...(backofficeRole ? { backofficeRole } : {}),
    isVerified: values.isVerified,
    isAdmin,
  }
}

const buildUserCreatePayload = (values: UserFormValues): UserCreate => ({
  ...buildUserBasePayload(values),
  isDemo: values.isDemo,
  password: values.password,
  userType: USER_TYPE.USUARIO,
})

export const parseUserCreateForm = (
  values: UserFormValues,
):
  | { success: true, data: UserCreate }
  | { success: false, errors: UserFormErrors } => {
  const errors = validateUserForm(values, 'create')

  if (Object.values(errors).some(Boolean)) {
    return { success: false, errors }
  }

  try {
    return {
      success: true,
      data: buildUserCreatePayload(values),
    }
  } catch {
    return {
      success: false,
      errors: {
        ...errors,
        birthDate: 'Ingresa una fecha de nacimiento válida.',
      },
    }
  }
}

export const parseUserUpdateForm = (
  values: UserFormValues,
):
  | { success: true, data: UserUpdate }
  | { success: false, errors: UserFormErrors } => {
  const errors = validateUserForm(values, 'edit')

  if (Object.values(errors).some(Boolean)) {
    return { success: false, errors }
  }

  try {
    return {
      success: true,
      data: buildUserBasePayload(values),
    }
  } catch {
    return {
      success: false,
      errors: {
        ...errors,
        birthDate: 'Ingresa una fecha de nacimiento válida.',
      },
    }
  }
}

export const normalizeBackofficeRole = (value: unknown): string => {
  if (typeof value !== 'string') return ''

  const normalized = value.trim().toUpperCase()
  if (normalized === BACKOFFICE_ROLE.OPERARIO || normalized === BACKOFFICE_ROLE.ADMINISTRADOR) {
    return normalized
  }

  return ''
}

export const mapUserListToFormValues = (
  user: UserList,
  countries: Array<{ phonePrefix: string }> = [],
): UserFormValues => {
  const birthDate = user.birthDate ? new Date(user.birthDate) : null
  const parsedBirthDate = birthDate && !Number.isNaN(birthDate.getTime()) ? birthDate : null
  const accountDemo = resolveUserAccountDemo(user)

  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    username: '',
    email: user.email ?? '',
    municipalityId: user.municipalityId ?? '',
    birthDate: parsedBirthDate,
    phonePrefix: resolvePhonePrefixOption(user.phonePrefix ?? '', countries),
    phoneNumber: String(user.phoneNumber ?? ''),
    backofficeRole: normalizeBackofficeRole(user.backofficeRole),
    isVerified: user.isVerified ?? false,
    isAdmin: user.isAdmin ?? false,
    isDemo: accountDemo ?? false,
    password: '',
    userType: USER_TYPE.USUARIO,
  }
}
