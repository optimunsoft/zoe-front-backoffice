import type { CompanyList, PaginatedCompaniesResponse } from '~/core/company/types/company.types'
import type { PaginatedUsersResponse, UserList } from '~/modules/administration/users/types/users.types'

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

const normalizeId = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

const pickId = (value: unknown, keys: string[] = ['id', 'companyId', 'company_id', 'userId', 'user_id', '_id']): string | null => {
  const record = asRecord(value)
  if (!record) return null

  for (const key of keys) {
    const id = normalizeId(record[key])
    if (id) return id
  }

  return null
}

const pickNestedEntity = (value: unknown, keys: string[]): unknown => {
  const record = asRecord(value)
  if (!record) return null

  for (const key of keys) {
    if (key in record) return record[key]
  }

  return null
}

export const extractCreatedUserId = (
  response: UserList | UserList[] | PaginatedUsersResponse | null | undefined,
): string | null => {
  if (!response) return null

  if (Array.isArray(response)) {
    return pickId(response[0], ['id', 'userId', 'user_id', '_id'])
  }

  const direct = pickId(response, ['id', 'userId', 'user_id', '_id'])
  if (direct) return direct

  const nestedUser = pickNestedEntity(response, ['user', 'data', 'item', 'result'])
  if (Array.isArray(nestedUser)) {
    return pickId(nestedUser[0], ['id', 'userId', 'user_id', '_id'])
  }

  const nestedId = pickId(nestedUser, ['id', 'userId', 'user_id', '_id'])
  if (nestedId) return nestedId

  const paginated = response as PaginatedUsersResponse
  const list = paginated.data ?? paginated.items ?? paginated.users
  if (Array.isArray(list) && list.length > 0) {
    return pickId(list[0], ['id', 'userId', 'user_id', '_id'])
  }

  return null
}

export const extractCreatedCompanyId = (
  company: CompanyList | Record<string, unknown> | null | undefined,
  response?: CompanyList[] | PaginatedCompaniesResponse | Record<string, unknown> | null,
): string | null => {
  const fromCompany = pickId(company, ['id', 'companyId', 'company_id', '_id'])
  if (fromCompany) return fromCompany

  if (!response) return null

  if (Array.isArray(response)) {
    return pickId(response[0], ['id', 'companyId', 'company_id', '_id'])
  }

  const direct = pickId(response, ['id', 'companyId', 'company_id', '_id'])
  if (direct) return direct

  const nestedCompany = pickNestedEntity(response, ['company', 'data', 'item', 'result'])
  if (Array.isArray(nestedCompany)) {
    return pickId(nestedCompany[0], ['id', 'companyId', 'company_id', '_id'])
  }

  const nestedId = pickId(nestedCompany, ['id', 'companyId', 'company_id', '_id'])
  if (nestedId) return nestedId

  const paginated = response as PaginatedCompaniesResponse
  const list = paginated.data ?? paginated.items ?? paginated.companies
  if (Array.isArray(list) && list.length > 0) {
    return pickId(list[0], ['id', 'companyId', 'company_id', '_id'])
  }

  return null
}
