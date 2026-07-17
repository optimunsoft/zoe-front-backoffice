import type { User } from '~/modules/administration/users/types/users.types'
import type { UTableColumn, UTableRow } from '~/core/ui/Tables/utable.types'
import { formatTableEmail } from '~/shared/utils/format'

const formatFullName = (user: Pick<User, 'firstName' | 'lastName'>) => {
  const name = [user.firstName, user.lastName].map((part) => part?.trim()).filter(Boolean).join(' ')
  return name || '-'
}

export const userColumns: UTableColumn[] = [
  { key: 'fullName', label: 'Nombre y apellidos', variant: 'emphasis', toggleable: false },
  { key: 'email', label: 'Email' },
  {
    key: 'role',
    label: 'Tipo',
    type: 'badge',
    align: 'center',
    badgeColorMap: {
      Root: 'primary',
      Subusuario: 'neutral',
    },
  },
  {
    key: 'isActive',
    label: 'Estado',
    type: 'badge',
    align: 'center',
    badgeColorMap: {
      Activo: 'success',
      Inactivo: 'danger',
    },
  },
  {
    key: 'isVerified',
    label: 'Verificado',
    type: 'badge',
    align: 'center',
    badgeColorMap: {
      Sí: 'success',
      No: 'danger',
    },
  },
  { key: 'companiesCount', label: 'Cantidad de empresas', align: 'center' },
]

export const mapUsersToTableRows = (userList: User[]): UTableRow[] => {
  return userList.map((user) => {
    const companiesCount = user.companies?.length ?? 0

    return {
      id: user.id,
      fullName: formatFullName(user),
      email: formatTableEmail(user.email),
      role: user.userType === 'USUARIO' ? 'Root' : 'Subusuario',
      isActive: user.isActive ? 'Activo' : 'Inactivo',
      isVerified: user.isVerified ? 'Sí' : 'No',
      companiesCount,
      hasCompanies: companiesCount > 0,
      hasSessions: (user.sessions?.length ?? 0) > 0,
    }
  })
}
