import type { UTableActionButton } from '~/core/ui/Tables/utable.types'

export const userTableActions: UTableActionButton[] = [
  { key: 'companies', label: 'Compañías', icon: 'company', tooltip: 'Empresas' },
  { key: 'sessions', label: 'Sesiones', icon: 'history', tooltip: 'Sesiones' },
  { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar' },
]

export const resolveUserTableActions = (): UTableActionButton[] => userTableActions
