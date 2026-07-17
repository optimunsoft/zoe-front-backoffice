import type { UTableActionButton } from '~/core/ui/Tables/utable.types'
import { USER_TYPE } from '../types/users.types'

export const userTableActions: UTableActionButton[] = [
  { key: 'companies', label: 'Empresas', icon: 'company', tooltip: 'Empresas' },
  { key: 'sessions', label: 'Sesiones', icon: 'history', tooltip: 'Sesiones' },
  { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar' },
]

export const resolveUserTableActions = (options?: {
  isRoot?: boolean
}): UTableActionButton[] => {
  const isRoot = options?.isRoot ?? false

  return userTableActions.filter((action) => {
    if (action.key === 'edit') return isRoot
    return true
  })
}

export const isRootUserType = (userType: string | undefined | null) =>
  userType === USER_TYPE.USUARIO
