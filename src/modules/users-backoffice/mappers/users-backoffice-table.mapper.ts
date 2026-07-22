import { BACKOFFICE_ROLE } from '~/modules/administration/users/types/users.types'
import type { UserList } from '../types/userBackoffice.types'
import type { UTableColumn, UTableRow } from '~/core/ui/Tables/utable.types'
import { formatTableEmail } from '~/shared/utils/format'

const EMPTY_CELL = '-'

const formatFullName = (user: Pick<UserList, 'firstName' | 'lastName'>) => {
  const name = [user.firstName, user.lastName].map((part) => part?.trim()).filter(Boolean).join(' ')
  return name || EMPTY_CELL
}

const formatBackofficeRole = (role?: string | null) => {
  const normalized = role?.trim().toUpperCase()
  if (normalized === BACKOFFICE_ROLE.ADMINISTRADOR) return 'Administrador'
  if (normalized === BACKOFFICE_ROLE.OPERARIO) return 'Consultor'
  return normalized || EMPTY_CELL
}

export const usersBackofficeColumns: UTableColumn[] = [
  { key: 'fullName', label: 'Nombre', variant: 'emphasis', toggleable: false },
  { key: 'email', label: 'Correo' },
  {
    key: 'role',
    label: 'Tipo',
    type: 'badge',
    align: 'center',
    badgeColorMap: {
      Administrador: 'primary',
      Operario: 'neutral',
    },
  },
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
  { key: 'companiesCount', label: 'Cantidad de empresas', align: 'center' },
]

export const mapUsersBackofficeToTableRows = (users: UserList[]): UTableRow[] =>
  users.map((user) => {
    const companiesCount = user.companies?.length ?? 0

    return {
      id: user.id,
      fullName: formatFullName(user),
      email: formatTableEmail(user.email, EMPTY_CELL),

      role: formatBackofficeRole(user.backofficeRole),
      status: user.isActive ? 'Activo' : 'Inactivo',
      companiesCount,
      hasCompanies: companiesCount > 0,
    }
  })
