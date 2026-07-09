import type { UTableActionButton } from '~/core/ui/Tables/utable.types'

export const moduleTableActions: UTableActionButton[] = [
  { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar módulo' },
  { key: 'delete', label: 'Eliminar', icon: 'delete', tooltip: 'Eliminar módulo', tone: 'danger' },
]
