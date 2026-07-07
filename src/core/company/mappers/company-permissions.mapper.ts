import { toTitleCase } from '~/shared/utils/format'

import type { BadgeColor } from '~/core/ui/badge/badge.types'
import type { userCompanyPermissions } from '../types/company.types'

export type PermissionItemGroup = {
  name: string
  description: string | null
  actions: string[]
}

export type PermissionResourceGroup = {
  resource: string
  label: string
  permissionCount: number
  items: PermissionItemGroup[]
}

export type PermissionProductGroup = {
  module: string
  label: string
  permissionCount: number
  resources: PermissionResourceGroup[]
}

const ACTION_LABELS: Record<string, string> = {
  create: 'Crear',
  read: 'Leer',
  update: 'Editar',
  edit: 'Editar',
  delete: 'Eliminar',
  list: 'Listar',
  export: 'Exportar',
  import: 'Importar',
  approve: 'Aprobar',
  reject: 'Rechazar',
  manage: 'Gestionar',
  cancel: 'Anular',
  close: 'Cerrar',
  open: 'Abrir',
  move: 'Mover',
  view: 'Ver',
  save: 'Guardar',
  print: 'Imprimir',
  download: 'Descargar',
  upload: 'Subir',
  sync: 'Sincronizar',
  activate: 'Activar',
  deactivate: 'Desactivar',
  enable: 'Habilitar',
  disable: 'Deshabilitar',
}

const ACTION_PHRASE_LABELS: Record<string, string> = {
  'edit-from-integration': 'Editar desde integración',
  'add-fiscal-year': 'Agregar año fiscal',
  'close-fiscal-year': 'Cerrar año fiscal',
  'close-month': 'Cerrar mes',
  'move-third': 'Mover tercero',
  'move-account': 'Mover cuenta',
  'move-accounts': 'Mover cuentas',
  'move-third-party': 'Mover tercero',
  'move-third-parties': 'Mover terceros',
}

const ACTION_TOKEN_LABELS: Record<string, string> = {
  add: 'agregar',
  edit: 'editar',
  cancel: 'anular',
  close: 'cerrar',
  open: 'abrir',
  move: 'mover',
  delete: 'eliminar',
  remove: 'eliminar',
  create: 'crear',
  read: 'leer',
  view: 'ver',
  list: 'listar',
  export: 'exportar',
  import: 'importar',
  approve: 'aprobar',
  reject: 'rechazar',
  manage: 'gestionar',
  activate: 'activar',
  deactivate: 'desactivar',
  enable: 'habilitar',
  disable: 'deshabilitar',
  save: 'guardar',
  print: 'imprimir',
  download: 'descargar',
  upload: 'subir',
  sync: 'sincronizar',
  from: 'desde',
  integration: 'integración',
  fiscal: 'fiscal',
  year: 'año',
  month: 'mes',
  third: 'tercero',
  thirds: 'terceros',
  thirdparty: 'tercero',
  thirdparties: 'terceros',
  account: 'cuenta',
  accounts: 'cuentas',
  party: 'tercero',
  parties: 'terceros',
}

const normalizeActionKey = (action: string) =>
  action
    .trim()
    .replace(/_/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/\s+/g, '-')

const splitActionTokens = (action: string) =>
  normalizeActionKey(action).split('-').filter(Boolean)

const capitalizePhrase = (value: string) => {
  const text = value.trim()
  if (!text) return ''

  return text.charAt(0).toUpperCase() + text.slice(1)
}

const translateActionTokens = (tokens: string[]) => {
  if (!tokens.length) return ''

  const fiscalYearIndex = tokens.findIndex((token, index) =>
    token === 'fiscal' && tokens[index + 1] === 'year',
  )

  if (fiscalYearIndex !== -1) {
    const before = tokens.slice(0, fiscalYearIndex)
    const after = tokens.slice(fiscalYearIndex + 2)
    const parts = [
      ...before.map((token) => ACTION_TOKEN_LABELS[token] ?? token),
      'año fiscal',
      ...after.map((token) => ACTION_TOKEN_LABELS[token] ?? token),
    ]

    return capitalizePhrase(parts.join(' '))
  }

  const translated = tokens.map((token) => ACTION_TOKEN_LABELS[token] ?? token)
  return capitalizePhrase(translated.join(' '))
}

export const formatPermissionAction = (action: string): string => {
  const key = normalizeActionKey(action)
  if (!key) return ''

  if (ACTION_PHRASE_LABELS[key]) return ACTION_PHRASE_LABELS[key]
  if (ACTION_LABELS[key]) return ACTION_LABELS[key]

  const tokens = splitActionTokens(action)
  if (tokens.length > 1) {
    return translateActionTokens(tokens)
  }

  const singleToken = tokens[0] ?? key
  return ACTION_LABELS[singleToken] ?? capitalizePhrase(ACTION_TOKEN_LABELS[singleToken] ?? singleToken)
}

export const getPermissionActionColor = (action: string): BadgeColor => {
  const key = normalizeActionKey(action)
  const rootToken = splitActionTokens(action)[0] ?? key

  switch (rootToken) {
    case 'delete':
    case 'remove':
    case 'cancel':
      return 'danger'
    case 'create':
    case 'add':
    case 'activate':
    case 'enable':
      return 'success'
    case 'update':
    case 'edit':
    case 'move':
      return 'warning'
    case 'read':
    case 'list':
    case 'view':
      return 'info'
    case 'close':
      return 'neutral'
    default:
      return 'violet'
  }
}

const compareLabels = (left: string, right: string) =>
  left.localeCompare(right, 'es', { sensitivity: 'base' })

const compareActions = (left: string, right: string) =>
  formatPermissionAction(left).localeCompare(formatPermissionAction(right), 'es', {
    sensitivity: 'base',
  })

const groupPermissionsByName = (
  permissions: userCompanyPermissions[],
): PermissionItemGroup[] => {
  const groups = new Map<string, { description: string | null; actions: Set<string> }>()

  for (const permission of permissions) {
    const name = permission.name.trim() || 'Permiso'
    const current = groups.get(name) ?? {
      description: permission.description,
      actions: new Set<string>(),
    }

    if (!current.description && permission.description) {
      current.description = permission.description
    }

    if (permission.action.trim()) {
      current.actions.add(permission.action.trim())
    }

    groups.set(name, current)
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => compareLabels(left, right))
    .map(([name, value]) => ({
      name,
      description: value.description,
      actions: Array.from(value.actions).sort(compareActions),
    }))
}

export const groupPermissionsByProduct = (
  permissions: userCompanyPermissions[],
): PermissionProductGroup[] => {
  const products = new Map<string, Map<string, userCompanyPermissions[]>>()

  for (const permission of permissions) {
    const moduleKey = permission.module.trim() || 'General'
    const resourceKey = permission.resource.trim() || 'General'

    if (!products.has(moduleKey)) {
      products.set(moduleKey, new Map())
    }

    const resources = products.get(moduleKey)!
    const current = resources.get(resourceKey) ?? []
    current.push(permission)
    resources.set(resourceKey, current)
  }

  return Array.from(products.entries())
    .sort(([left], [right]) => compareLabels(left, right))
    .map(([module, resourcesMap]) => {
      const resources = Array.from(resourcesMap.entries())
        .sort(([left], [right]) => compareLabels(left, right))
        .map(([resource, items]) => {
          const groupedItems = groupPermissionsByName(items)

          return {
            resource,
            label: toTitleCase(resource),
            permissionCount: items.length,
            items: groupedItems,
          }
        })

      const permissionCount = resources.reduce(
        (total, resource) => total + resource.permissionCount,
        0,
      )

      return {
        module,
        label: toTitleCase(module),
        permissionCount,
        resources,
      }
    })
}
