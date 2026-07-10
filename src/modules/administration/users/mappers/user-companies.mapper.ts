import type { UserCompany } from '../types/users.types'

export type UserCompanyDetailColumn = {
  key: 'name' | 'documentNumber' | 'email' | 'roles' | 'permissions'
  label: string
}

export const userCompanyDetailColumns: UserCompanyDetailColumn[] = [
  { key: 'name', label: 'Compañía' },
  { key: 'documentNumber', label: 'NIT' },
  { key: 'email', label: 'Email' },
  { key: 'roles', label: 'Roles' },
  { key: 'permissions', label: 'Permisos' },
]

export const formatUserCompanyName = (company: UserCompany) => {
  const businessName = company.businessName?.trim()
  if (businessName) return businessName

  const tradeName = company.tradeName?.trim()
  if (tradeName) return tradeName

  const documentNumber = company.documentNumber?.trim()
  if (documentNumber) return documentNumber

  return company.id
}

export const getVisibleUserCompanies = (companies: UserCompany[] | undefined | null) => {
  if (!Array.isArray(companies)) return []

  return [...companies].sort((left, right) => {
    if (left.isOwner !== right.isOwner) return left.isOwner ? -1 : 1
    return formatUserCompanyName(left).localeCompare(formatUserCompanyName(right), 'es')
  })
}
