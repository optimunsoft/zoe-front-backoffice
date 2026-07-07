import type { UTableActionButton } from '~/core/ui/Tables/utable.types'

export const companyTableActions: UTableActionButton[] = [
  { key: 'users', label: 'Usuarios', icon: 'users' },
  { key: 'edit', label: 'Editar', icon: 'edit' },
  { key: 'delete', label: 'Eliminar', icon: 'delete', tone: 'danger' },
]
