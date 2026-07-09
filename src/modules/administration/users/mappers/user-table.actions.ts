import type { UTableActionButton } from '~/core/ui/Tables/utable.types'

export const userTableActions: UTableActionButton[] = [
  { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar' },
  { key: 'delete', label: 'Eliminar', icon: 'delete', tone: 'danger', tooltip: 'Eliminar' },
]
