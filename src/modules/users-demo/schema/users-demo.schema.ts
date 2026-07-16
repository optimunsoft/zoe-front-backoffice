import { z } from 'zod'

import {
  resolveDefaultPhonePrefix,
  resolvePhonePrefixOption,
} from '~/core/ubication/utils/phone.utils'
import type { User, UserUpdate } from '~/modules/administration/users/types/users.types'
import type { UsersDemoFormErrors, UsersDemoFormValues } from '../types/users-demo.types'

const NAME_REGEX = /^[\p{L}\s'.-]+$/u
const PHONE_REGEX = /^\d{7,15}$/

export const sanitizeUsersDemoName = (value: string) =>
  value.replace(/[^\p{L}\s'.-]/gu, '')

export const sanitizeUsersDemoPhoneNumber = (value: unknown) =>
  String(value ?? '').replace(/\D/g, '').slice(0, 15)

const birthDateValue = z.union([z.string(), z.date()]).nullable()

const usersDemoFormSchema = z.object({
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
  isVerified: z.boolean(),
  isAdmin: z.boolean(),
  backofficeRole: z.string(),
})

export const emptyUsersDemoFormValues = (): UsersDemoFormValues => ({
  firstName: '',
  lastName: '',
  email: '',
  municipalityId: '',
  birthDate: null,
  phonePrefix: resolveDefaultPhonePrefix([]),
  phoneNumber: '',
  isVerified: false,
  isAdmin: false,
  backofficeRole: '',
})

export const emptyUsersDemoFormErrors = (): UsersDemoFormErrors => ({
  firstName: '',
  lastName: '',
  email: '',
  municipalityId: '',
  birthDate: '',
  phonePrefix: '',
  phoneNumber: '',
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

const mapFormErrors = (error: z.ZodError): UsersDemoFormErrors => {
  const errors = emptyUsersDemoFormErrors()

  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key !== 'string' || !(key in errors)) continue
    if (!errors[key as keyof UsersDemoFormErrors]) {
      errors[key as keyof UsersDemoFormErrors] = issue.message
    }
  }

  return errors
}

export const validateUsersDemoForm = (values: UsersDemoFormValues): UsersDemoFormErrors => {
  const result = usersDemoFormSchema.superRefine((data, ctx) => {
    if (!data.birthDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'La fecha de nacimiento es obligatoria.',
        path: ['birthDate'],
      })
      return
    }

    if (!parseBirthDate(data.birthDate)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ingresa una fecha de nacimiento válida.',
        path: ['birthDate'],
      })
    }
  }).safeParse(values)

  if (result.success) return emptyUsersDemoFormErrors()
  return mapFormErrors(result.error)
}

export const mapUserToUsersDemoFormValues = (
  user: User,
  countries: Array<{ phonePrefix: string }> = [],
): UsersDemoFormValues => {
  const birthDate = user.birthDate ? new Date(user.birthDate) : null

  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    municipalityId: user.municipalityId ?? '',
    birthDate: birthDate && !Number.isNaN(birthDate.getTime()) ? birthDate : null,
    phonePrefix: resolvePhonePrefixOption(user.phonePrefix ?? '', countries),
    phoneNumber: sanitizeUsersDemoPhoneNumber(user.phoneNumber),
    isVerified: Boolean(user.isVerified),
    isAdmin: Boolean(user.isAdmin),
    backofficeRole: user.backofficeRole ?? '',
  }
}

export const parseUsersDemoUpdateForm = (
  values: UsersDemoFormValues,
):
  | { success: true, data: UserUpdate }
  | { success: false, errors: UsersDemoFormErrors } => {
  const errors = validateUsersDemoForm(values)

  if (Object.values(errors).some(Boolean)) {
    return { success: false, errors }
  }

  const birthDate = parseBirthDate(values.birthDate)
  if (!birthDate) {
    return {
      success: false,
      errors: {
        ...errors,
        birthDate: 'Ingresa una fecha de nacimiento válida.',
      },
    }
  }

  const isAdmin = values.isAdmin
  const backofficeRole = isAdmin ? values.backofficeRole.trim() : ''

  return {
    success: true,
    data: {
      email: values.email.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      municipalityId: values.municipalityId.trim(),
      birthDate,
      phonePrefix: values.phonePrefix.trim(),
      phoneNumber: values.phoneNumber.trim(),
      ...(backofficeRole ? { backofficeRole } : {}),
    } as UserUpdate,
  }
}
