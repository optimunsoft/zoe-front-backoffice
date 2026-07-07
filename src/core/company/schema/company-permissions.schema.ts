import type { CompanyRolePermissions, userCompanyPermissions } from '../types/company.types'

type RawRecord = Record<string, unknown>

const pickString = (source: RawRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string') return value
  }

  return ''
}

const pickNullableString = (source: RawRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = source[key]
    if (value === null) return null
    if (typeof value === 'string') return value
  }

  return null
}

export const normalizePermissionItem = (raw: unknown): userCompanyPermissions => {
  const item = (raw && typeof raw === 'object' ? raw : {}) as RawRecord

  return {
    id: pickString(item, 'id'),
    module: pickString(item, 'module'),
    resource: pickString(item, 'resource'),
    action: pickString(item, 'action'),
    name: pickString(item, 'name'),
    description: pickNullableString(item, 'description'),
  }
}

export const normalizeCompanyRolePermissions = (raw: unknown): CompanyRolePermissions => {
  const item = (raw && typeof raw === 'object' ? raw : {}) as RawRecord
  const permissions = Array.isArray(item.permissions)
    ? item.permissions.map((permission) => normalizePermissionItem(permission))
    : []

  return {
    id: pickString(item, 'id'),
    name: pickString(item, 'name'),
    description: pickString(item, 'description'),
    isSystem: Boolean(item.isSystem ?? item.is_system),
    permissions,
  }
}
