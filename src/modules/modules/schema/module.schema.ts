import { z } from 'zod'

import type { Module, ModuleList } from '../types/modules.types'

export const sanitizeModuleCode = (value: string) =>
  value.replace(/\D/g, '').slice(0, 3)

export const sanitizeModulePrice = (value: string) =>
  value.replace(/\D/g, '').slice(0, 12)

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

const ALLOWED_CONTROL_KEYS = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
])

export const isAllowedDigitsOnlyKey = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return true
  if (ALLOWED_CONTROL_KEYS.has(event.key)) return true
  return /^\d$/.test(event.key)
}

export const blockNonDigitKeydown = (event: KeyboardEvent) => {
  if (!isAllowedDigitsOnlyKey(event)) {
    event.preventDefault()
  }
}

export const extractDigitsFromClipboard = (event: ClipboardEvent) => {
  const pasted = event.clipboardData?.getData('text') ?? ''
  return sanitizeModulePrice(pasted)
}

export const moduleFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'El código es obligatorio.')
    .regex(/^\d+$/, 'El código solo puede contener números.')
    .length(3, 'El código debe tener exactamente 3 dígitos.'),
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
