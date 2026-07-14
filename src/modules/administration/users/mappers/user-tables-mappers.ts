import type { User } from '~/modules/administration/users/types/users.types'
import type { UTableColumn, UTableRow } from '~/core/ui/Tables/utable.types'

const formatFullName = (user: Pick<User, 'firstName' | 'lastName'>) => {
  const name = [user.firstName, user.lastName].map((part) => part?.trim()).filter(Boolean).join(' ')
  return name || '-'
}

export const userColumns: UTableColumn[] = [
  { key: 'fullName', label: 'Nombre y apellidos', variant: 'emphasis', toggleable: false },
  { key: 'email', label: 'Email' },
  {
    key: 'role',
    label: 'Rol',
    type: 'badge',
    align: 'center',
    badgeColorMap: {
      Usuario: 'primary',
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
  { key: 'isAdmin', label: 'SuperUsuario' },
]

export const mapUsersToTableRows = (userList: User[]): UTableRow[] => {
  return userList.map((user) => ({
    id: user.id,
    fullName: formatFullName(user),
    email: user.email?.trim() ?? '',
    isAdminUser: user.isAdmin,
    role: user.userType === 'USUARIO' ? 'Usuario' : 'Subusuario',
    isActive: user.isActive ? 'Activo' : 'Inactivo',
    isVerified: user.isVerified ? 'Sí' : 'No',
    isAdmin: user.isAdmin ? 'Soporte' : '-',
    hasCompanies: (user.companies?.length ?? 0) > 0,
    hasSessions: (user.sessions?.length ?? 0) > 0,
  }))
}
