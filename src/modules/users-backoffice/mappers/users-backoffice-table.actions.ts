import type { UTableActionButton } from '~/core/ui/Tables/utable.types'

export const usersBackofficeTableActions: UTableActionButton[] = [
  { key: 'companies', label: 'Empresas', icon: 'company', tooltip: 'Empresas' },
  { key: 'assignCompanies', label: 'Asociar empresas', icon: 'userAdd', tooltip: 'Asociar empresas' },
  { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar' },
]
