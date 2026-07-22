import {
  formatUserCompanyName,
  getVisibleUserCompanies,
} from '~/modules/administration/users/mappers/user-companies.mapper'
import type { User } from '~/modules/administration/users/types/users.types'
import type { UTableColumn, UTableRow } from '~/core/ui/Tables/utable.types'
import { formatTableDate, formatTableEmail } from '~/shared/utils/format'

const EMPTY_CELL = '-'

const formatFullName = (user: User) => {
  const name = [user.firstName, user.lastName].map((part) => part?.trim()).filter(Boolean).join(' ')
  return name || EMPTY_CELL
}

const formatPhone = (user: User) => {
  const raw = user.phoneNumber?.trim()
  if (!raw) return EMPTY_CELL

  const withoutCountryCode = raw.replace(/^\+?57\s*/, '')
  const digits = withoutCountryCode.replace(/\D/g, '')

  return digits || EMPTY_CELL
}

const formatSessionsCount = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return EMPTY_CELL
  return String(value)
}

const formatCompanyName = (user: User) => {
  const companies = getVisibleUserCompanies(user.companies)
  if (!companies.length) return EMPTY_CELL

  return companies.map(formatUserCompanyName).join(', ')
}

export const usersDemoColumns: UTableColumn[] = [
  { key: 'fullName', label: 'Nombres y apellidos', variant: 'emphasis', toggleable: false },
  { key: 'email', label: 'Correo electrónico' },
  { key: 'phone', label: 'Teléfono' },
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
  {
    key: 'verified',
    label: 'Verificado',
    type: 'badge',
    align: 'center',
    badgeColorMap: {
      Sí: 'success',
      No: 'danger',
    },
  },
  { key: 'registeredAt', label: 'Fecha de registro' },
  { key: 'lastLoginAt', label: 'Último ingreso' },
  { key: 'sessionsCount', label: 'Número de sesiones', align: 'center' },
]

export const mapUsersDemoToTableRows = (users: User[]): UTableRow[] =>
  users.map((user) => ({
    id: user.id,
    fullName: formatFullName(user),
    email: formatTableEmail(user.email, EMPTY_CELL),
    phone: formatPhone(user),
    status: user.isActive ? 'Activo' : 'Inactivo',
    verified: user.isVerified ? 'Sí' : 'No',
    registeredAt: formatTableDate(user.createdAt),
    lastLoginAt: formatTableDate(user.last_login_at),
    sessionsCount: formatSessionsCount(user.total_sessions),
    companyName: formatCompanyName(user),
  }))
