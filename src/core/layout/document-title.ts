import type { RouteLocationNormalizedLoaded } from 'vue-router'

import {
  sidebarMenuSections,
  type SidebarMenuContext,
  type SidebarMenuItem,
} from './sidebar/sidebar-menu'

const APP_NAME = 'Zoe Backoffice'

const STATIC_ROUTE_TITLES: Array<{ match: (path: string) => boolean; label: string }> = [
  {
    match: (path) => path === '/login' || path.startsWith('/login/'),
    label: 'Inicio de sesión',
  },
  {
    match: (path) => path.includes('/administration'),
    label: 'Administración',
  },
]

const resolveItemPath = (
  to: SidebarMenuItem['to'],
  context: SidebarMenuContext,
): string | undefined => {
  if (!to) return undefined
  return typeof to === 'function' ? to(context) : to
}

const normalizePath = (path: string) => {
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1)
  return path
}

const collectMenuEntries = (
  items: SidebarMenuItem[],
  context: SidebarMenuContext,
): Array<{ path: string; label: string }> => {
  const entries: Array<{ path: string; label: string }> = []

  for (const item of items) {
    const path = resolveItemPath(item.to, context)
    if (path) {
      entries.push({ path: normalizePath(path), label: item.label })
    }

    if (item.children?.length) {
      entries.push(...collectMenuEntries(item.children, context))
    }
  }

  return entries
}

export const resolveDocumentModuleLabel = (
  route: RouteLocationNormalizedLoaded,
): string | null => {
  const path = normalizePath(route.path)
  const context: SidebarMenuContext = { route }

  const menuEntries = sidebarMenuSections.flatMap((section) =>
    collectMenuEntries(section.items, context),
  )

  const matchedMenuEntry = menuEntries
    .filter((entry) => path === entry.path || path.startsWith(`${entry.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0]

  if (matchedMenuEntry) return matchedMenuEntry.label

  return STATIC_ROUTE_TITLES.find((entry) => entry.match(path))?.label ?? null
}

export const buildDocumentTitle = (route: RouteLocationNormalizedLoaded): string => {
  const moduleLabel = resolveDocumentModuleLabel(route)
  return moduleLabel ? `${APP_NAME} - ${moduleLabel}` : APP_NAME
}

export { APP_NAME }
