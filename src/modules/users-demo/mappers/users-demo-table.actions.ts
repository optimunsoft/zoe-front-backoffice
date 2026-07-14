import type { UTableActionButton } from '~/core/ui/Tables/utable.types'

export const usersDemoTableActions: UTableActionButton[] = [
  { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar' },
  { key: 'delete', label: 'Eliminar', icon: 'delete', tooltip: 'Eliminar', tone: 'danger' },
]
