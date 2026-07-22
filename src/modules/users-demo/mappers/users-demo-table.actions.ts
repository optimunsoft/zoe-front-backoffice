import type { UTableActionButton } from '~/core/ui/Tables/utable.types'

export const usersDemoTableActions: UTableActionButton[] = [
  { key: 'companies', label: 'Empresas', icon: 'company', tooltip: 'Empresas' },
  { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar' },
  { key: 'delete', label: 'Eliminar', icon: 'delete', tooltip: 'Eliminar', tone: 'danger' },
]

/** Eliminar solo para backofficeRole ADMINISTRADOR. */
export const resolveUsersDemoTableActions = (
  isAdminBackOfficeUser: boolean,
): UTableActionButton[] => {
  if (isAdminBackOfficeUser) return usersDemoTableActions

  return usersDemoTableActions.filter((action) => action.key !== 'delete')
}
