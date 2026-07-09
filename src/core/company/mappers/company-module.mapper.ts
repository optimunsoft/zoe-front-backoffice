import type { ModuleList } from '~/modules/modules/types/modules.types'

import { ActiveModule, type CompanyModule } from '../types/company.types'

type RawCompanyModuleRecord = Record<string, unknown>

const pickString = (source: RawCompanyModuleRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string') return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }

  return ''
}

const ACTIVE_STATUS_VALUES = new Set([
  ActiveModule.ACTIVO,
  'active',
  'activo',
  'enabled',
  'true',
  '1',
])

const INACTIVE_STATUS_VALUES = new Set([
  ActiveModule.INACTIVO,
  'inactive',
  'inactivo',
  'disabled',
  'false',
  '0',
])

const normalizeStatus = (item: RawCompanyModuleRecord): ActiveModule => {
  const status = pickString(item, 'status').toUpperCase()
  if (status === ActiveModule.ACTIVO) return ActiveModule.ACTIVO
  if (status === ActiveModule.INACTIVO) return ActiveModule.INACTIVO
  if (ACTIVE_STATUS_VALUES.has(status.toLowerCase())) return ActiveModule.ACTIVO
  if (INACTIVE_STATUS_VALUES.has(status.toLowerCase())) return ActiveModule.INACTIVO

  const active = item.active ?? item.isActive ?? item.is_active
  if (typeof active === 'boolean') return active ? ActiveModule.ACTIVO : ActiveModule.INACTIVO
  if (active === 1 || active === '1' || active === 'true') return ActiveModule.ACTIVO
  if (active === 0 || active === '0' || active === 'false') return ActiveModule.INACTIVO

  return ActiveModule.ACTIVO
}

export const normalizeCompanyModule = (
  raw: CompanyModule | RawCompanyModuleRecord | string,
): CompanyModule => {
  if (typeof raw === 'string') {
    const moduleId = raw.trim()
    return {
      moduleId,
      code: '',
      name: '',
      status: ActiveModule.ACTIVO,
    }
  }

  const item = raw as RawCompanyModuleRecord

  return {
    moduleId: pickString(item, 'moduleId', 'module_id', 'id'),
    code: pickString(item, 'code'),
    name: pickString(item, 'name'),
    status: normalizeStatus(item),
  }
}

export const normalizeCompanyModules = (value: unknown): CompanyModule[] => {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => normalizeCompanyModule(item as CompanyModule | RawCompanyModuleRecord | string))
    .filter((item) => item.moduleId)
}

export const isCompanyModuleActive = (module: Pick<CompanyModule, 'status'>) =>
  module.status === ActiveModule.ACTIVO

export const toCompanyModuleStatus = (active: boolean): ActiveModule =>
  active ? ActiveModule.ACTIVO : ActiveModule.INACTIVO

export const mapModuleListToCompanyModule = (
  module: ModuleList,
  status: ActiveModule = ActiveModule.ACTIVO,
): CompanyModule => ({
  moduleId: module.id,
  code: module.code,
  name: module.name,
  status,
})
