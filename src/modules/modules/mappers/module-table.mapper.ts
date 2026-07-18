import type { UTableColumn, UTableRow } from '~/core/ui/Tables/utable.types'

import type { ModuleList } from '../types/modules.types'

type RawModuleRecord = Record<string, unknown>

const pickString = (source: RawModuleRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string') return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }

  return ''
}

const pickNullableString = (source: RawModuleRecord, ...keys: string[]) => {
  const value = pickString(source, ...keys)
  return value || null
}

const pickNullableNumber = (source: RawModuleRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }

  return null
}

const pickBoolean = (source: RawModuleRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'boolean') return value
    if (value === 1 || value === '1' || value === 'true') return true
    if (value === 0 || value === '0' || value === 'false') return false
  }

  return true
}

export const formatModulePrice = (value: number | null | undefined) => {
  if (value == null) return '-'

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export const normalizeModuleListItem = (raw: ModuleList | RawModuleRecord): ModuleList => {
  const item = raw as RawModuleRecord

  return {
    id: pickString(item, 'id', 'moduleId', 'module_id'),
    code: pickString(item, 'code'),
    name: pickString(item, 'name'),
    description: pickNullableString(item, 'description'),
    active: pickBoolean(item, 'active', 'isActive', 'is_active'),
    price: pickNullableNumber(item, 'price'),
    createdAt: pickString(item, 'createdAt', 'created_at') as unknown as Date,
    updatedAt: pickString(item, 'updatedAt', 'updated_at') as unknown as Date,
  }
}

export const normalizeModulesListResponse = (response: unknown): ModuleList[] => {
  if (Array.isArray(response)) {
    return response.map((item) => normalizeModuleListItem(item as RawModuleRecord))
  }

  if (!response || typeof response !== 'object') return []

  const record = response as RawModuleRecord
  const nested = record.data ?? record.items ?? record.modules ?? record.results

  if (Array.isArray(nested)) {
    return nested.map((item) => normalizeModuleListItem(item as RawModuleRecord))
  }

  if (nested && typeof nested === 'object') {
    const paginated = nested as RawModuleRecord
    const data = paginated.data ?? paginated.items ?? paginated.modules ?? paginated.results

    if (Array.isArray(data)) {
      return data.map((item) => normalizeModuleListItem(item as RawModuleRecord))
    }
  }

  return []
}

export const moduleColumns: UTableColumn[] = [
  { key: 'code', label: 'Código', variant: 'emphasis', toggleable: false },
  { key: 'name', label: 'Nombre', variant: 'emphasis' },
  { key: 'description', label: 'Descripción' },
  { key: 'price', label: 'Precio' },
  {
    key: 'status',
    label: 'Estado',
    type: 'badge',
    align: 'center',
    badgeColorMap: {
      Activo: 'success',
      Inactivo: 'danger',
    },
  },
]

export const mapModulesToTableRows = (modules: ModuleList[]): UTableRow[] =>
  modules.map((module) => ({
    id: module.id,
    code: module.code || '-',
    name: module.name || '-',
    description: module.description?.trim() || '-',
    price: formatModulePrice(module.price),
    status: module.active ? 'Activo' : 'Inactivo',
  }))

export const hasModuleCellValue = (value: unknown) => {
  if (typeof value !== 'string') return false
  const text = value.trim()
  return text.length > 0 && text !== '-'
}
