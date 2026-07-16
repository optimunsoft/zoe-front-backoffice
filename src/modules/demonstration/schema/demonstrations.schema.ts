import { z } from 'zod'

import {
  DEFAULT_PHONE_PREFIX,
  normalizePhonePrefixDigits,
  resolveDefaultPhonePrefix,
  resolvePhonePrefixOption,
} from '~/core/ubication/utils/phone.utils'
import type {
  Demonstration,
  DemonstrationResponse,
  PaginatedDemonstrationsResponse,
  UpdateDemonstration,
} from '../types/demonstration.types'
import { DemonstrationStatus } from '../types/demonstration.types'

const NAME_REGEX = /^[\p{L}\s'.-]+$/u
const PHONE_REGEX = /^\d{7,15}$/
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

export const sanitizeDemonstrationName = (value: string) =>
  value.replace(/[^\p{L}\s'.-]/gu, '')

export const sanitizeDemonstrationPhone = (value: string) =>
  value.replace(/\D/g, '').slice(0, 15)

export const splitDemonstrationPhone = (
  phone: string,
  countries: Array<{ phonePrefix: string }> = [],
): { phonePrefix: string, phoneNumber: string } => {
  const digits = sanitizeDemonstrationPhone(phone)
  const defaultPrefix = resolveDefaultPhonePrefix(countries)

  if (!digits) {
    return {
      phonePrefix: defaultPrefix,
      phoneNumber: '',
    }
  }

  const prefixes = [
    ...new Set(
      countries
        .map((country) => normalizePhonePrefixDigits(country.phonePrefix))
        .filter(Boolean)
        .sort((a, b) => b.length - a.length),
    ),
  ]

  if (!prefixes.includes(DEFAULT_PHONE_PREFIX)) {
    prefixes.push(DEFAULT_PHONE_PREFIX)
  }

  for (const prefix of prefixes) {
    if (digits.startsWith(prefix) && digits.length > prefix.length + 6) {
      return {
        phonePrefix: resolvePhonePrefixOption(prefix, countries),
        phoneNumber: digits.slice(prefix.length),
      }
    }
  }

  return {
    phonePrefix: defaultPrefix,
    phoneNumber: digits,
  }
}

export const buildDemonstrationPhone = (phonePrefix: string, phoneNumber: string) => {
  const prefix = phonePrefix.trim().replace(/^\+/, '')
  const number = sanitizeDemonstrationPhone(phoneNumber)

  if (!prefix || !number) return number

  return `+${prefix}${number}`
}

const scheduledDateValue = z.union([
  z.string(),
  z.date(),
  z.array(z.date()),
]).nullable()

const LEGACY_STATUS_MAP: Record<string, DemonstrationStatus> = {
  EXECUTED: DemonstrationStatus.EJECUTADA,
  CANCELLED: DemonstrationStatus.CANCELADA,
}

export const DEMONSTRATION_PRODUCT_OPTIONS = [
  'Contabilidad',
  'Factura Electronica',
  'Administrativo de Escritorio',
] as const

export type DemonstrationProductOption = (typeof DEMONSTRATION_PRODUCT_OPTIONS)[number]

const normalizeProductLabel = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Mapea un valor del API al label canónico de los checkboxes. */
export const canonicalizeProductInterest = (value: string): DemonstrationProductOption | null => {
  const normalized = normalizeProductLabel(value)
  if (!normalized) return null

  for (const option of DEMONSTRATION_PRODUCT_OPTIONS) {
    if (normalizeProductLabel(option) === normalized) return option
  }

  // Aliases frecuentes del backend / datos legacy.
  if (normalized.includes('contabilidad')) return 'Contabilidad'
  if (normalized.includes('factura')) return 'Factura Electronica'
  if (normalized.includes('administrativo')) return 'Administrativo de Escritorio'

  return null
}

const pushProductChunks = (target: string[], value: unknown) => {
  if (value == null) return

  if (Array.isArray(value)) {
    value.forEach((item) => pushProductChunks(target, item))
    return
  }

  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
      if (entry === true || entry === 1 || entry === '1') {
        target.push(key)
        return
      }
      if (typeof entry === 'string' && entry.trim()) {
        target.push(entry)
      }
    })
    return
  }

  const text = String(value).trim()
  if (!text) return

  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text) as unknown
      pushProductChunks(target, parsed)
      return
    } catch {
      // sigue como texto plano
    }
  }

  text.split(/[,;|]/).forEach((chunk) => {
    const trimmed = chunk.trim()
    if (trimmed) target.push(trimmed)
  })
}

export const normalizeProductInterest = (value: unknown): string[] => {
  const rawItems: string[] = []
  pushProductChunks(rawItems, value)

  const canonical = new Set<string>()
  for (const item of rawItems) {
    const matched = canonicalizeProductInterest(item)
    if (matched) canonical.add(matched)
  }

  return [...canonical]
}

type RawDemonstrationRecord = Record<string, unknown>

const pickString = (source: RawDemonstrationRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string') return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }

  return ''
}

const pickDateValue = (source: RawDemonstrationRecord, ...keys: string[]): Date | string => {
  for (const key of keys) {
    const value = source[key]
    if (value instanceof Date) return value
    if (typeof value === 'string' && value.trim()) return value
  }

  return ''
}

const pickTotal = (source: RawDemonstrationRecord, fallback: number) => {
  const pagination = source.pagination ?? source.meta ?? source.metadata
  const paginationRecord = pagination && typeof pagination === 'object'
    ? pagination as RawDemonstrationRecord
    : null

  const candidates: unknown[] = [
    source.total,
    source.totalCount,
    source.total_count,
    source.count,
    source.totalRecords,
    source.total_records,
    source.totalElements,
    source.total_elements,
    paginationRecord?.total,
    paginationRecord?.totalCount,
    paginationRecord?.total_count,
    paginationRecord?.count,
  ]

  for (const value of candidates) {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }

  return fallback
}

const pickListItems = (source: RawDemonstrationRecord): unknown[] | null => {
  const nested = source.data ?? source.items ?? source.demonstrations ?? source.results
    ?? source.rows ?? source.content ?? source.records

  if (Array.isArray(nested)) return nested

  if (nested && typeof nested === 'object') {
    const paginated = nested as RawDemonstrationRecord
    const data = paginated.data ?? paginated.items ?? paginated.demonstrations ?? paginated.results
      ?? paginated.rows ?? paginated.content ?? paginated.records

    if (Array.isArray(data)) return data
  }

  return null
}

export const normalizeDemonstrationListItem = (
  raw: DemonstrationResponse | RawDemonstrationRecord,
): DemonstrationResponse => {
  const item = raw as RawDemonstrationRecord

  return {
    id: pickString(item, 'id'),
    name: pickString(item, 'name'),
    email: pickString(item, 'email'),
    scheduledAt: pickDateValue(item, 'scheduledAt', 'scheduled_at') as Date,
    phone: pickString(item, 'phone'),
    productInterest: normalizeProductInterest(
      item.productInterest ?? item.product_interest,
    ),
    status: normalizeDemonstrationStatus(item.status) ?? DemonstrationStatus.PENDIENTE,
    createdAt: pickDateValue(item, 'createdAt', 'created_at') as Date,
    updatedAt: pickDateValue(item, 'updatedAt', 'updated_at') as Date,
  }
}

export const normalizeDemonstrationsListResponse = (
  response: unknown,
): { demonstrations: DemonstrationResponse[]; total: number } => {
  const mapItems = (items: unknown[]) =>
    items.map((item) => normalizeDemonstrationListItem(item as RawDemonstrationRecord))

  if (Array.isArray(response)) {
    const demonstrations = mapItems(response)
    return { demonstrations, total: demonstrations.length }
  }

  if (!response || typeof response !== 'object') {
    return { demonstrations: [], total: 0 }
  }

  const record = response as RawDemonstrationRecord
  const listItems = pickListItems(record)

  if (listItems) {
    const demonstrations = mapItems(listItems)
    return {
      demonstrations,
      total: pickTotal(record, demonstrations.length),
    }
  }

  if ('id' in record) {
    const demonstrations = [normalizeDemonstrationListItem(record)]
    return { demonstrations, total: 1 }
  }

  return { demonstrations: [], total: 0 }
}

export const normalizeDemonstrationStatus = (value: unknown): DemonstrationStatus | undefined => {
  if (value == null || value === '') return undefined

  const normalized = String(value).trim().toUpperCase()
  if (LEGACY_STATUS_MAP[normalized]) return LEGACY_STATUS_MAP[normalized]

  if (Object.values(DemonstrationStatus).includes(normalized as DemonstrationStatus)) {
    return normalized as DemonstrationStatus
  }

  return undefined
}

export const demonstrationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'El nombre no puede superar 100 caracteres.')
    .regex(NAME_REGEX, 'El nombre solo puede contener letras.'),
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio.')
    .email('Ingresa un email válido.'),
  phonePrefix: z
    .string()
    .trim()
    .min(1, 'Selecciona el prefijo telefónico.'),
  phoneNumber: z
    .string()
    .trim()
    .min(1, 'El teléfono es obligatorio.')
    .regex(PHONE_REGEX, 'El teléfono debe contener solo números (7 a 15 dígitos).'),
  scheduledDate: scheduledDateValue,
  scheduledTime: z
    .string()
    .trim()
    .min(1, 'La hora es obligatoria.')
    .regex(TIME_REGEX, 'Ingresa una hora válida (HH:mm).'),
  productInterest: z
    .array(z.union([z.string(), z.number()]).transform(String))
    .min(1, 'Selecciona al menos un producto.'),
}).superRefine((data, ctx) => {
  if (!data.scheduledDate) {
    ctx.addIssue({
      code: 'custom',
      message: 'La fecha es obligatoria.',
      path: ['scheduledDate'],
    })
    return
  }

  const parsedDate = parseScheduledDate(data.scheduledDate)
  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    ctx.addIssue({
      code: 'custom',
      message: 'Ingresa una fecha válida.',
      path: ['scheduledDate'],
    })
    return
  }

  if (!buildScheduledAt(data.scheduledDate, data.scheduledTime)) {
    ctx.addIssue({
      code: 'custom',
      message: 'La fecha u hora no son válidas.',
      path: ['scheduledDate'],
    })
  }
})

export const demonstrationUpdateFormSchema = demonstrationFormSchema.extend({
  status: z.preprocess(
    normalizeDemonstrationStatus,
    z.nativeEnum(DemonstrationStatus, {
      message: 'Selecciona un estado.',
    }),
  ),
})

export type DemonstrationFormValues = z.input<typeof demonstrationFormSchema>
export type DemonstrationUpdateFormValues = z.input<typeof demonstrationUpdateFormSchema>
export type DemonstrationFormErrors = Record<
  | 'name'
  | 'email'
  | 'phonePrefix'
  | 'phoneNumber'
  | 'scheduledDate'
  | 'scheduledTime'
  | 'productInterest'
  | 'status',
  string
>

export const emptyDemonstrationFormErrors = (): DemonstrationFormErrors => ({
  name: '',
  email: '',
  phonePrefix: '',
  phoneNumber: '',
  scheduledDate: '',
  scheduledTime: '',
  productInterest: '',
  status: '',
})

const formatTimeValue = (date: Date) => {
  if (Number.isNaN(date.getTime())) return ''

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export const mapDemonstrationResponseToFormValues = (
  demonstration: DemonstrationResponse,
  countries: Array<{ phonePrefix: string }> = [],
): DemonstrationUpdateFormValues => {
  const scheduledAt = new Date(demonstration.scheduledAt)
  const validScheduledAt = Number.isNaN(scheduledAt.getTime()) ? null : scheduledAt
  const { phonePrefix, phoneNumber } = splitDemonstrationPhone(demonstration.phone, countries)

  return {
    name: demonstration.name,
    email: demonstration.email,
    phonePrefix,
    phoneNumber,
    productInterest: normalizeProductInterest(demonstration.productInterest),
    scheduledDate: validScheduledAt,
    scheduledTime: validScheduledAt ? formatTimeValue(validScheduledAt) : '',
    status: normalizeDemonstrationStatus(demonstration.status) ?? demonstration.status,
  }
}

export const normalizeDemonstrationResponse = (
  response: unknown,
): DemonstrationResponse | null => {
  const { demonstrations } = normalizeDemonstrationsListResponse(response)
  return demonstrations[0] ?? null
}

export const parseScheduledDate = (
  value: string | Date | Date[] | null,
): Date | null => {
  if (!value) return null

  if (value instanceof Date) return value

  if (Array.isArray(value)) {
    const firstDate = value[0]
    return firstDate instanceof Date ? firstDate : null
  }

  const parts = value.split('/').map(Number)
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null

  const [day, month, year] = parts
  if (day == null || month == null || year == null) return null

  return new Date(year, month - 1, day)
}

export const buildScheduledAt = (
  scheduledDate: string | Date | Date[] | null,
  scheduledTime: string,
): Date | null => {
  const date = parseScheduledDate(scheduledDate)
  if (!date || !scheduledTime) return null

  const [hours, minutes] = scheduledTime.split(':').map(Number)
  if (hours == null || minutes == null || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
  )
}

export const mapDemonstrationFormErrors = (error: z.ZodError): DemonstrationFormErrors => {
  const errors = emptyDemonstrationFormErrors()

  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key !== 'string' || !(key in errors)) continue
    if (!errors[key as keyof DemonstrationFormErrors]) {
      errors[key as keyof DemonstrationFormErrors] = issue.message
    }
  }

  return errors
}

export const parseDemonstrationForm = (
  values: DemonstrationFormValues,
):
  | { success: true, data: Demonstration }
  | { success: false, errors: DemonstrationFormErrors } => {
  const result = demonstrationFormSchema.safeParse(values)

  if (!result.success) {
    return {
      success: false,
      errors: mapDemonstrationFormErrors(result.error),
    }
  }

  const scheduledAt = buildScheduledAt(
    result.data.scheduledDate,
    result.data.scheduledTime,
  )

  if (!scheduledAt) {
    return {
      success: false,
      errors: {
        ...emptyDemonstrationFormErrors(),
        scheduledDate: 'La fecha u hora no son válidas.',
      },
    }
  }

  return {
    success: true,
    data: {
      name: result.data.name,
      email: result.data.email,
      phone: buildDemonstrationPhone(result.data.phonePrefix, result.data.phoneNumber),
      productInterest: result.data.productInterest,
      scheduledAt,
    },
  }
}

export const parseDemonstrationUpdateForm = (
  values: DemonstrationUpdateFormValues,
):
  | { success: true, data: UpdateDemonstration }
  | { success: false, errors: DemonstrationFormErrors } => {
  const result = demonstrationUpdateFormSchema.safeParse(values)

  if (!result.success) {
    return {
      success: false,
      errors: mapDemonstrationFormErrors(result.error),
    }
  }

  const scheduledAt = buildScheduledAt(
    result.data.scheduledDate,
    result.data.scheduledTime,
  )

  if (!scheduledAt) {
    return {
      success: false,
      errors: {
        ...emptyDemonstrationFormErrors(),
        scheduledDate: 'La fecha u hora no son válidas.',
      },
    }
  }

  return {
    success: true,
    data: {
      name: result.data.name,
      email: result.data.email,
      phone: buildDemonstrationPhone(result.data.phonePrefix, result.data.phoneNumber),
      productInterest: result.data.productInterest,
      scheduledAt,
      status: result.data.status,
    },
  }
}
