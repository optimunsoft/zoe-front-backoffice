import { z } from 'zod'

import type {
  CompanyList,
  CompanyRequestBody,
  CompanyUpdateRequestBody,
  companyMunicipality,
  userCompany,
} from '../types/company.types'

type RawCompanyRecord = Record<string, unknown>

const pickString = (source: RawCompanyRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string') return value
  }

  return ''
}

const normalizeMunicipality = (value: unknown): companyMunicipality => {
  const municipality = (value && typeof value === 'object' ? value : {}) as RawCompanyRecord
  const state = (municipality.state && typeof municipality.state === 'object'
    ? municipality.state
    : {}) as RawCompanyRecord

  return {
    id: pickString(municipality, 'id'),
    code: pickString(municipality, 'code'),
    name: pickString(municipality, 'name'),
    state: {
      id: pickString(state, 'id'),
      code: pickString(state, 'code'),
      name: pickString(state, 'name'),
    },
  }
}

const normalizeRoles = (value: unknown): userCompany['roles'] => {
  if (!Array.isArray(value)) return []

  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const role = item as RawCompanyRecord

      return {
        id: pickString(role, 'id'),
        name: pickString(role, 'name'),
      }
    })
}

const normalizeUsers = (value: unknown): userCompany[] => {
  if (!Array.isArray(value)) return []

  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const user = item as RawCompanyRecord

      return {
        id: pickString(user, 'id'),
        userType: pickString(user, 'userType', 'user_type'),
        email: pickString(user, 'email'),
        firstName: pickString(user, 'firstName', 'first_name'),
        lastName: pickString(user, 'lastName', 'last_name'),
        isActive: Boolean(user.isActive ?? user.is_active),
        isDeleted: Boolean(user.isDeleted ?? user.is_deleted),
        isOwner: Boolean(user.isOwner ?? user.is_owner),
        roles: normalizeRoles(user.roles),
      }
    })
}

export const normalizeCompanyListItem = (raw: CompanyList | RawCompanyRecord): CompanyList => {
  const item = raw as RawCompanyRecord

  return {
    id: pickString(item, 'id'),
    hasApiKey: Boolean(item.hasApiKey ?? item.has_api_key),
    users: normalizeUsers(item.users),
    businessNatureId: pickString(item, 'businessNatureId', 'business_nature_id'),
    taxResponsibilityId: pickString(item, 'taxResponsibilityId', 'tax_responsibility_id'),
    vatRegimeId: pickString(item, 'vatRegimeId', 'vat_regime_id'),
    documentTypeId: pickString(item, 'documentTypeId', 'document_type_id'),
    municipality: normalizeMunicipality(item.municipality),
    documentNumber: pickString(item, 'documentNumber', 'document_number'),
    businessName: pickString(item, 'businessName', 'business_name'),
    tradeName: pickString(item, 'tradeName', 'trade_name'),
    firstName: pickString(item, 'firstName', 'first_name'),
    middleName: pickString(item, 'middleName', 'middle_name'),
    lastName: pickString(item, 'lastName', 'last_name'),
    secondLastName: pickString(item, 'secondLastName', 'second_last_name'),
    email: pickString(item, 'email'),
    accountantName: pickString(item, 'accountantName', 'accountant_name'),
    professionalCard: pickString(item, 'professionalCard', 'professional_card'),
    address: pickString(item, 'address'),
  }
}

const NAME_REGEX = /^[\p{L}\s'.-]+$/u
const DOCUMENT_NUMBER_REGEX = /^\d{5,15}$/
const VERIFICATION_DIGIT_REGEX = /^\d$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type CompanyFormValues = {
  ownerUserId: string
  documentTypeId: string
  documentNumber: string
  verificationDigit: string
  vatRegimeId: string
  taxResponsibilityId: string
  businessNatureId: string
  tradeName: string
  businessName: string
  firstName: string
  middleName: string
  lastName: string
  secondLastName: string
  municipalityId: string
  address: string
  email: string
  accountantName: string
  professionalCardNumber: string
}

export type CompanyFormErrors = Partial<Record<keyof CompanyFormValues, string>>

export const emptyCompanyFormErrors = (): CompanyFormErrors => ({})

export const emptyCompanyFormValues = (): CompanyFormValues => ({
  ownerUserId: '',
  documentTypeId: '',
  documentNumber: '',
  verificationDigit: '',
  vatRegimeId: '',
  taxResponsibilityId: '',
  businessNatureId: '',
  tradeName: '',
  businessName: '',
  firstName: '',
  middleName: '',
  lastName: '',
  secondLastName: '',
  municipalityId: '',
  address: '',
  email: '',
  accountantName: '',
  professionalCardNumber: '',
})

export const sanitizeCompanyDocumentNumber = (value: string) =>
  value.replace(/\D/g, '').slice(0, 15)

export const sanitizeVerificationDigit = (value: string) =>
  value.replace(/\D/g, '').slice(0, 1)

export const sanitizeCompanyName = (value: string) =>
  value.replace(/[^\p{L}\s'.-]/gu, '')

const baseCompanyFormSchema = z.object({
  ownerUserId: z.string().min(1, 'Selecciona el dueño de la empresa.'),
  documentTypeId: z.string().min(1, 'Selecciona el tipo de identificación.'),
  documentNumber: z
    .string()
    .trim()
    .min(1, 'El NIT es obligatorio.')
    .regex(DOCUMENT_NUMBER_REGEX, 'Ingresa un NIT válido (5 a 15 dígitos).'),
  verificationDigit: z
    .string()
    .trim()
    .refine((value) => value === '' || VERIFICATION_DIGIT_REGEX.test(value), {
      message: 'El DV debe ser un solo dígito.',
    }),
  vatRegimeId: z.string().min(1, 'Selecciona el régimen de IVA.'),
  taxResponsibilityId: z.string().min(1, 'Selecciona la responsabilidad tributaria.'),
  businessNatureId: z.string().min(1, 'Selecciona el tipo de persona.'),
  tradeName: z.string().trim().max(120, 'El nombre comercial no puede superar 120 caracteres.'),
  businessName: z.string().trim(),
  firstName: z.string().trim(),
  middleName: z.string().trim(),
  lastName: z.string().trim(),
  secondLastName: z.string().trim(),
  municipalityId: z.string().min(1, 'Selecciona el municipio.'),
  address: z
    .string()
    .trim()
    .min(1, 'La dirección es obligatoria.')
    .max(200, 'La dirección no puede superar 200 caracteres.'),
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es obligatorio.')
    .regex(EMAIL_REGEX, 'Ingresa un correo electrónico válido.'),
  accountantName: z
    .string()
    .trim()
    .max(100, 'El nombre del contador no puede superar 100 caracteres.')
    .refine((value) => value === '' || NAME_REGEX.test(value), {
      message: 'El nombre del contador solo puede contener letras.',
    }),
  professionalCardNumber: z
    .string()
    .trim()
    .max(30, 'El número de tarjeta profesional no puede superar 30 caracteres.'),
})

export const parseCompanyForm = (
  values: CompanyFormValues,
  options: { isNaturalPerson: boolean, isJuridicaPerson: boolean, mode?: 'create' | 'edit' },
) => {
  const mode = options.mode ?? 'create'
  const schema = mode === 'create'
    ? baseCompanyFormSchema
    : baseCompanyFormSchema.omit({ ownerUserId: true })

  const result = schema.safeParse(values)

  if (!result.success) {
    const errors = emptyCompanyFormErrors()

    for (const issue of result.error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string' && !errors[field as keyof CompanyFormValues]) {
        errors[field as keyof CompanyFormValues] = issue.message
      }
    }

    return { success: false as const, errors }
  }

  const errors = emptyCompanyFormErrors()

  if (options.isNaturalPerson) {
    if (!result.data.firstName) {
      errors.firstName = 'El primer nombre es obligatorio.'
    } else if (!NAME_REGEX.test(result.data.firstName)) {
      errors.firstName = 'El primer nombre solo puede contener letras.'
    }

    if (result.data.middleName && !NAME_REGEX.test(result.data.middleName)) {
      errors.middleName = 'El segundo nombre solo puede contener letras.'
    }

    if (!result.data.lastName) {
      errors.lastName = 'El primer apellido es obligatorio.'
    } else if (!NAME_REGEX.test(result.data.lastName)) {
      errors.lastName = 'El primer apellido solo puede contener letras.'
    }

    if (result.data.secondLastName && !NAME_REGEX.test(result.data.secondLastName)) {
      errors.secondLastName = 'El segundo apellido solo puede contener letras.'
    }
  } else if (options.isJuridicaPerson) {
    if (!result.data.businessName.trim()) {
      errors.businessName = 'La razón social es obligatoria.'
    } else if (result.data.businessName.length > 150) {
      errors.businessName = 'La razón social no puede superar 150 caracteres.'
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false as const, errors }
  }

  const basePayload = {
    documentTypeId: result.data.documentTypeId,
    documentNumber: result.data.documentNumber,
    vatRegimeId: result.data.vatRegimeId,
    taxResponsibilityId: result.data.taxResponsibilityId,
    businessNatureId: result.data.businessNatureId,
    tradeName: result.data.tradeName.trim(),
    businessName: options.isJuridicaPerson ? result.data.businessName.trim() : '',
    firstName: options.isNaturalPerson ? result.data.firstName.trim() : '',
    middleName: options.isNaturalPerson ? result.data.middleName.trim() : '',
    lastName: options.isNaturalPerson ? result.data.lastName.trim() : '',
    secondLastName: options.isNaturalPerson ? result.data.secondLastName.trim() : '',
    municipalityId: result.data.municipalityId,
    address: result.data.address,
    email: result.data.email.trim(),
    accountantName: result.data.accountantName.trim(),
    professionalCard: result.data.professionalCardNumber.trim(),
  }

  if (mode === 'edit') {
    return {
      success: true as const,
      data: basePayload as CompanyUpdateRequestBody,
      meta: {
        verificationDigit: result.data.verificationDigit,
      },
    }
  }

  const payload: CompanyRequestBody = {
    ...basePayload,
    ownerUserId: result.data.ownerUserId,
  }

  return {
    success: true as const,
    data: payload,
    meta: {
      verificationDigit: result.data.verificationDigit,
    },
  }
}

export const mapCompanyToFormValues = (company: CompanyList): CompanyFormValues => {
  const normalized = normalizeCompanyListItem(company)

  return {
    ownerUserId: '',
    documentTypeId: normalized.documentTypeId,
    documentNumber: normalized.documentNumber,
    verificationDigit: pickString(company as RawCompanyRecord, 'verificationDigit', 'verification_digit', 'dv'),
    vatRegimeId: normalized.vatRegimeId,
    taxResponsibilityId: normalized.taxResponsibilityId,
    businessNatureId: normalized.businessNatureId,
    tradeName: '',
    businessName: normalized.businessName,
    firstName: normalized.firstName,
    middleName: normalized.middleName,
    lastName: normalized.lastName,
    secondLastName: normalized.secondLastName,
    municipalityId: normalized.municipality?.id ?? '',
    address: normalized.address,
    email: normalized.email,
    accountantName: normalized.accountantName,
    professionalCardNumber: normalized.professionalCard,
  }
}
