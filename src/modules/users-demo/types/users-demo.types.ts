import type { ApiResponse } from '~/shared/interfaces/api'

export type UsersDemoFormValues = {
  firstName: string
  lastName: string
  email: string
  municipalityId: string
  birthDate: string | Date | null
  phonePrefix: string
  phoneNumber: string
  isVerified: boolean
  isAdmin: boolean
  backofficeRole: string
}

export type UsersDemoFormErrors = Record<
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'municipalityId'
  | 'birthDate'
  | 'phonePrefix'
  | 'phoneNumber',
  string
>

export type DeleteUsersDemoResult = {
  userId: string
  accountId: string
  deletedCompanies: string[]
  deleted: boolean
}

export type DeleteUsersDemoResponse = ApiResponse<DeleteUsersDemoResult>
export type DeleteUsersDemoCompanyResult = DeleteUsersDemoResult;
