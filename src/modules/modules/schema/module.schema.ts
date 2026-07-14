import { z } from 'zod'

import {
  blockNonDigitKeydown,
  extractDigitsFromClipboard,
  sanitizeDigitsInput,
} from '~/shared/utils/digits-input.utils'
import type { Module, ModuleList } from '../types/modules.types'

export const sanitizeModuleCode = (value: string) =>
  value.replace(/[^a-zA-Z0-9-]/g, '')

export const sanitizeModulePrice = (value: string) =>
  sanitizeDigitsInput(value, 12)

export const formatModulePriceInput = (value: string) => {
  const digits = sanitizeModulePrice(value)
  if (!digits) return ''

  const number = Number(digits)
  if (!Number.isFinite(number)) return ''

  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(number)
}

export const parseModulePriceInput = (value: string) =>
  sanitizeModulePrice(value)

export { blockNonDigitKeydown, extractDigitsFromClipboard } from '~/shared/utils/digits-input.utils'

export const moduleFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'El código es obligatorio.')
    .regex(/^[a-zA-Z0-9-]+$/, 'El código solo puede contener letras, números y guiones.'),
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'El nombre no puede superar 100 caracteres.'),
  description: z
    .string()
    .trim()
    .max(500, 'La descripción no puede superar 500 caracteres.'),
  price: z
    .string()
    .trim(),
}).superRefine((data, ctx) => {
  if (!data.price) return

  const digits = parseModulePriceInput(data.price)
  if (!digits) {
    ctx.addIssue({
      code: 'custom',
      message: 'Ingresa un precio válido.',
      path: ['price'],
    })
    return
  }

  const parsed = Number(digits)
  if (!Number.isFinite(parsed)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Ingresa un precio válido.',
      path: ['price'],
    })
    return
  }

  if (parsed < 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'El precio no puede ser negativo.',
      path: ['price'],
    })
  }
})

export type ModuleFormValues = z.input<typeof moduleFormSchema>
export type ModuleFormErrors = Record<'code' | 'name' | 'description' | 'price', string>

export const emptyModuleFormValues = (): ModuleFormValues => ({
  code: '',
  name: '',
  description: '',
  price: '',
})

export const emptyModuleFormErrors = (): ModuleFormErrors => ({
  code: '',
  name: '',
  description: '',
  price: '',
})

export const mapModuleListToFormValues = (module: ModuleList | Module): ModuleFormValues => ({
  code: sanitizeModuleCode(module.code ?? ''),
  name: module.name ?? '',
  description: module.description ?? '',
  price: module.price == null ? '' : formatModulePriceInput(String(module.price)),
})

export const mapModuleFormErrors = (error: z.ZodError): ModuleFormErrors => {
  const errors = emptyModuleFormErrors()

  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key !== 'string' || !(key in errors)) continue
    if (!errors[key as keyof ModuleFormErrors]) {
      errors[key as keyof ModuleFormErrors] = issue.message
    }
  }

  return errors
}

export const validateModuleForm = (values: ModuleFormValues): ModuleFormErrors => {
  const result = moduleFormSchema.safeParse(values)
  if (result.success) return emptyModuleFormErrors()
  return mapModuleFormErrors(result.error)
}

export const parseModuleForm = (
  values: ModuleFormValues,
):
  | { success: true, data: Module }
  | { success: false, errors: ModuleFormErrors } => {
  const errors = validateModuleForm(values)

  if (Object.values(errors).some(Boolean)) {
    return {
      success: false,
      errors,
    }
  }

  const result = moduleFormSchema.safeParse(values)
  if (!result.success) {
    return {
      success: false,
      errors: mapModuleFormErrors(result.error),
    }
  }

  const description = result.data.description.trim()
  const priceDigits = parseModulePriceInput(result.data.price)

  return {
    success: true,
    data: {
      code: result.data.code,
      name: result.data.name,
      description: description || null,
      price: priceDigits ? Number(priceDigits) : null,
    },
  }
}
