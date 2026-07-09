import { toTitleCase } from '~/shared/utils/format'

import type { roleUserCompany, userCompany } from '../types/company.types'

export type CompanyUserDetailColumn = {
  key: 'name' | 'email' | 'userType' | 'status' | 'roles' | 'permissions'
  label: string
}

export const companyUserDetailColumns: CompanyUserDetailColumn[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'userType', label: 'Tipo' },
  { key: 'status', label: 'Estado' },
  { key: 'roles', label: 'Roles' },

]

export const formatCompanyUserName = (user: userCompany) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return fullName || user.email || '-'
}

export const formatCompanyUserType = (userType: string) => {
  if (!userType.trim()) return ''

  const formatted = toTitleCase(userType.trim())
  return formatted === 'Usuario' ? 'Administrador' : 'Subusuario'
}

export const isCompanyAdministratorUser = (user: userCompany) => {
  const formattedType = toTitleCase(user.userType?.trim() ?? '')
  if (formattedType === 'Usuario') return true

  return user.roles?.some((role) => {
    const name = role.name?.toLowerCase() ?? ''
    return name.includes('admin') || name.includes('administrador')
  }) ?? false
}

export const getCompanyAdministratorUsers = (users: userCompany[] | undefined | null) =>
  getVisibleCompanyUsers(users).filter((user) => user.isActive && isCompanyAdministratorUser(user))

export const formatCompanyUserRoles = (roles: roleUserCompany[]) => {
  const names = roles.map((role) => role.name.trim()).filter(Boolean)
  return names.length > 0 ? names.join(', ') : '-'
}

export const getVisibleCompanyUsers = (users: userCompany[] | undefined | null) => {
  if (!Array.isArray(users)) return []

  return users
    .filter((user) => !user.isDeleted)
    .sort((left, right) => {
      if (left.isOwner !== right.isOwner) return left.isOwner ? -1 : 1
      if (left.isActive !== right.isActive) return left.isActive ? -1 : 1
      return formatCompanyUserName(left).localeCompare(formatCompanyUserName(right), 'es')
    })
}
