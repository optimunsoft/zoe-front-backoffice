import type { userCompany } from '~/core/company/types/company.types'

import type { User, UserCompany } from '../types/users.types'

export type UserPermissionsContext = {
  companyId: string
  companyName: string
  user: userCompany
}

const formatCompanyName = (company: UserCompany) => {
  const businessName = company.businessName?.trim()
  if (businessName) return businessName

  const tradeName = company.tradeName?.trim()
  if (tradeName) return tradeName

  const documentNumber = company.documentNumber?.trim()
  if (documentNumber) return documentNumber

  return company.id
}

const mapUserToCompanyUser = (user: User, company: UserCompany): userCompany => ({
  id: user.id,
  userType: user.userType,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  isActive: user.isActive,
  isDeleted: false,
  isOwner: company.isOwner,
  roles: company.roles ?? [],
})

export const buildUserCompanyPermissionsPayload = (
  user: User,
  company: UserCompany,
): UserPermissionsContext => ({
  companyId: company.id,
  companyName: formatCompanyName(company),
  user: mapUserToCompanyUser(user, company),
})

export const resolveUserPermissionsContext = (
  user: User,
  preferredCompanyId?: string,
): UserPermissionsContext | null => {
  const companies = user.companies ?? []
  if (!companies.length) return null

  const company =
    (preferredCompanyId ? companies.find((item) => item.id === preferredCompanyId) : undefined)
    ?? companies.find((item) => (item.roles?.length ?? 0) > 0)
    ?? companies[0]

  if (!company) return null

  return buildUserCompanyPermissionsPayload(user, company)
}
