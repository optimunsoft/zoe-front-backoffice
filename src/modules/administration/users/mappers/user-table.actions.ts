import type { UTableActionButton } from '~/core/ui/Tables/utable.types'

export const userTableActions: UTableActionButton[] = [
  { key: 'companies', label: 'Compañías', icon: 'company', tooltip: 'Compañías' },
  { key: 'sessions', label: 'Sesiones', icon: 'history', tooltip: 'Sesiones' },
  { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar' },
]

type UserTableActionContext = {
  hasCompanies?: boolean
  hasSessions?: boolean
}

export const resolveUserTableActions = ({
  hasCompanies = false,
  hasSessions = false,
}: UserTableActionContext): UTableActionButton[] =>
  userTableActions.filter((action) => {
    if (action.key === 'companies') return hasCompanies
    if (action.key === 'sessions') return hasSessions
    return true
  })
