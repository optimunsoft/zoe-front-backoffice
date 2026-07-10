import type { User } from '~/modules/administration/users/types/users.types'
import { mapUserDemoLabel } from '~/modules/administration/users/utils/user-account.utils'
import type { UTableColumn, UTableRow } from '~/core/ui/Tables/utable.types'

export const userColumns: UTableColumn[] = [
  { key: 'firstName', label: 'Nombre', variant: 'emphasis', toggleable: false },
  { key: 'lastName', label: 'Apellido' },
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
    label: 'Activo',
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
      Verificado: 'success',
      'No verificado': 'danger',
    },
  },
  { key: 'isAdmin', label: 'SuperUsuario' },
  {
    key: 'isDemo',
    label: 'Demo',
    type: 'badge',
    align: 'center',
    badgeColorMap: {
      Sí: 'primary',
      No: 'neutral',
      'No Aplica': 'neutral',
    },
  },
]

export const mapUsersToTableRows = (userList: User[]): UTableRow[] => {
  return userList.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email?.trim() ?? '',
    isAdminUser: user.isAdmin,
    role: user.userType === 'USUARIO' ? 'Usuario' : 'Subusuario',
    isActive: user.isActive ? 'Activo' : 'Inactivo',
    isVerified: user.isVerified ? 'Verificado' : 'No verificado',
    isAdmin: user.isAdmin ? 'Soporte' : '-',
    isDemo: mapUserDemoLabel(user),
    hasCompanies: (user.companies?.length ?? 0) > 0,
    hasSessions: (user.sessions?.length ?? 0) > 0,
  }))
}
