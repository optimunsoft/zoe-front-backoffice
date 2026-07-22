import { z } from 'zod'

import {
  resolveDefaultPhonePrefix,
  resolvePhonePrefixOption,
} from '~/core/ubication/utils/phone.utils'
import { isPasswordValid } from '~/shared/utils/password.utils'
import { todayLocalDate } from '~/shared/utils/date.utils'
import {
  BACKOFFICE_ROLE,
} from '~/modules/administration/users/types/users.types'
import type {
  UserBackofficeCreate,
  UserBackofficeUpdate,
  UserList,
} from '../types/userBackoffice.types'

const NAME_REGEX = /^[\p{L}\s'.-]+$/u
const PHONE_REGEX = /^\d{7,15}$/

export const sanitizeUserBackofficeName = (value: string) =>
  value.replace(/[^\p{L}\s'.-]/gu, '')

export const sanitizeUserBackofficePhoneNumber = (value: unknown) =>
  String(value ?? '').replace(/\D/g, '').slice(0, 15)

const birthDateValue = z.union([
  z.string(),
  z.date(),
]).nullable()

const usersBackofficeFormFieldsSchema = z.object({
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
})

export type UsersBackofficeFormValues = z.input<typeof usersBackofficeFormFieldsSchema>

export type UsersBackofficeFormErrors = Record<
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'municipalityId'
  | 'birthDate'
  | 'phonePrefix'
  | 'phoneNumber'
  | 'backofficeRole'
  | 'password',
  string
>

export const emptyUsersBackofficeFormValues = (): UsersBackofficeFormValues => ({
  firstName: '',
  lastName: '',
  email: '',
  municipalityId: '',
  birthDate: todayLocalDate(),
  phonePrefix: resolveDefaultPhonePrefix([]),
  phoneNumber: '',
  backofficeRole: '',
  isVerified: false,
  isAdmin: true,
  isDemo: false,
  password: '',
})

export const emptyUsersBackofficeFormErrors = (): UsersBackofficeFormErrors => ({
  firstName: '',
  lastName: '',
  email: '',
  municipalityId: '',
  birthDate: '',
  phonePrefix: '',
  phoneNumber: '',
  backofficeRole: '',
  password: '',
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
      message: 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, un número y un carácter especial.',
      path: ['password'],
    })
  }
}

const validateBackofficeRole = (values: UsersBackofficeFormValues, ctx: z.RefinementCtx) => {
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

const mapUsersBackofficeFormErrors = (error: z.ZodError): UsersBackofficeFormErrors => {
  const errors = emptyUsersBackofficeFormErrors()

  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key !== 'string' || !(key in errors)) continue
    if (!errors[key as keyof UsersBackofficeFormErrors]) {
      errors[key as keyof UsersBackofficeFormErrors] = issue.message
    }
  }

  return errors
}

export const validateUsersBackofficeForm = (
  values: UsersBackofficeFormValues,
  mode: 'create' | 'edit',
): UsersBackofficeFormErrors => {
  const result = usersBackofficeFormFieldsSchema.superRefine((data, ctx) => {
    validateBirthDate(data.birthDate, ctx)
    validatePassword(data.password, mode, ctx)
    validateBackofficeRole(data, ctx)
  }).safeParse(values)

  if (result.success) return emptyUsersBackofficeFormErrors()
  return mapUsersBackofficeFormErrors(result.error)
}

const normalizeBackofficeRole = (value: unknown): string => {
  if (typeof value !== 'string') return ''

  const normalized = value.trim().toUpperCase()
  if (normalized === BACKOFFICE_ROLE.OPERARIO || normalized === BACKOFFICE_ROLE.ADMINISTRADOR) {
    return normalized
  }

  return ''
}

const buildUserBackofficeBasePayload = (values: UsersBackofficeFormValues): UserBackofficeUpdate => {
  const birthDate = parseBirthDate(values.birthDate)
  if (!birthDate) {
    throw new Error('Invalid birth date')
  }

  return {
    email: values.email.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    municipalityId: values.municipalityId.trim(),
    birthDate,
    phonePrefix: values.phonePrefix.trim(),
    phoneNumber: values.phoneNumber.trim(),
    backofficeRole: values.backofficeRole.trim(),
  }
}

const buildUserBackofficeCreatePayload = (values: UsersBackofficeFormValues): UserBackofficeCreate => ({
  ...buildUserBackofficeBasePayload(values),
  password: values.password,
})

export const parseUsersBackofficeCreateForm = (
  values: UsersBackofficeFormValues,
):
  | { success: true, data: UserBackofficeCreate }
  | { success: false, errors: UsersBackofficeFormErrors } => {
  const normalized = {
    ...values,
    isAdmin: true,
    isDemo: false,
  }
  const errors = validateUsersBackofficeForm(normalized, 'create')

  if (Object.values(errors).some(Boolean)) {
    return { success: false, errors }
  }

  try {
    return {
      success: true,
      data: buildUserBackofficeCreatePayload(normalized),
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

export const parseUsersBackofficeUpdateForm = (
  values: UsersBackofficeFormValues,
):
  | { success: true, data: UserBackofficeUpdate }
  | { success: false, errors: UsersBackofficeFormErrors } => {
  const normalized = {
    ...values,
    isAdmin: true,
    isDemo: false,
  }
  const errors = validateUsersBackofficeForm(normalized, 'edit')

  if (Object.values(errors).some(Boolean)) {
    return { success: false, errors }
  }

  try {
    return {
      success: true,
      data: buildUserBackofficeBasePayload(normalized),
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

export const mapUserListToUsersBackofficeFormValues = (
  user: UserList,
  countries: Array<{ phonePrefix: string }> = [],
): UsersBackofficeFormValues => {
  const birthDate = user.birthDate ? new Date(user.birthDate) : null
  const parsedBirthDate = birthDate && !Number.isNaN(birthDate.getTime()) ? birthDate : null

  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    municipalityId: user.municipalityId ?? '',
    birthDate: parsedBirthDate,
    phonePrefix: resolvePhonePrefixOption(user.phonePrefix ?? '', countries),
    phoneNumber: String(user.phoneNumber ?? ''),
    backofficeRole: normalizeBackofficeRole(user.backofficeRole),
    isVerified: false,
    isAdmin: true,
    isDemo: false,
    password: '',
  }
}
