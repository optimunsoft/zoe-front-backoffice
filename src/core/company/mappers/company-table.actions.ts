import type { UTableActionButton } from '~/core/ui/Tables/utable.types'

export const companyTableActions: UTableActionButton[] = [
  { key: 'users', label: 'Usuarios', icon: 'users', tooltip: 'Usuarios' },
  { key: 'assign-users', label: 'Asignar', icon: 'userAdd', tooltip: 'Asignar Usuarios' },
  { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar' },
]
