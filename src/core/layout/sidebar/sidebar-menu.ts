import type { RouteLocationNormalizedLoaded } from 'vue-router'

import type { UiIconName } from '~/core/ui/icons'

const BACKOFFICE_DASHBOARD_PATH = '/backoffice/dashboard'

export type SidebarMenuContext = {
  route: RouteLocationNormalizedLoaded
}

type SidebarMenuResolver<T> = T | ((context: SidebarMenuContext) => T)

export type SidebarMenuItem = {
  key?: string
  label: string
  icon?: UiIconName
  to?: SidebarMenuResolver<string>
  active?: SidebarMenuResolver<boolean>
  children?: SidebarMenuItem[]
}

export type SidebarMenuSection = {
  key: string
  title: string
  items: SidebarMenuItem[]
}

export const sidebarMenuSections: SidebarMenuSection[] = [
  {
    key: 'main',
    title: 'Menú',
    items: [
      {
        key: 'dashboard',
        label: 'Inicio',
        icon: 'dashboard',
        to: BACKOFFICE_DASHBOARD_PATH,
        active: ({ route }: SidebarMenuContext) => {
          return route.path === BACKOFFICE_DASHBOARD_PATH || route.path === `${BACKOFFICE_DASHBOARD_PATH}/`
        },
      },
      {
        key: 'administration',
        label: 'Administración',
        icon: 'administration',
        active: ({ route }: SidebarMenuContext) => {
          const path = route.path
          return (
            path.includes('/empresas')
            || (path.includes('/usuarios') && !path.includes('/usuarios-demo') && !path.includes('/superusuarios'))
          )
        },
        children: [
          {
            key: 'empresas-list',
            label: 'Empresas',
            to: `${BACKOFFICE_DASHBOARD_PATH}/empresas`,
          },
          {
            key: 'usuarios-list',
            label: 'Usuarios',
            to: `${BACKOFFICE_DASHBOARD_PATH}/usuarios`,
          },
        ],
      },
      {
        key: 'scheduling',
        label: 'Demostraciones',
        icon: 'scheduling',
        active: ({ route }: SidebarMenuContext) =>
          route.path.includes('/demonstrations') || route.path.includes('/usuarios-demo'),
        children: [
          {
            key: 'agendamientos-list',
            label: 'Agendamientos',
            to: `${BACKOFFICE_DASHBOARD_PATH}/demonstrations`,
          },
          {
            key: 'users-demo-list',
            label: 'Usuarios de Demo',
            to: `${BACKOFFICE_DASHBOARD_PATH}/usuarios-demo`,
          },
        ],
      },
      {
        key: 'configurations',
        label: 'Configuraciones',
        icon: 'settings',
        active: ({ route }: SidebarMenuContext) => {
          const path = route.path
          return path.includes('/modulos') || path.includes('/superusuarios')
        },
        children: [
          {
            key: 'modulos-list',
            label: 'Módulos',
            to: `${BACKOFFICE_DASHBOARD_PATH}/modulos`,
          },
          {
            key: 'superusuarios-list',
            label: 'Usuarios',
            to: `${BACKOFFICE_DASHBOARD_PATH}/superusuarios`,
          },
          {
            key: 'especial-list',
            label: 'Especiales',
            to: `${BACKOFFICE_DASHBOARD_PATH}/especiales`,
          },
        ],
      },
    ],
  },
]

export type SidebarMenuAccess = {
  canViewModules?: boolean
}

export const getSidebarMenuSections = (
  access: SidebarMenuAccess = {},
): SidebarMenuSection[] => {
  const canViewModules = access.canViewModules ?? false

  return sidebarMenuSections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (item.key !== 'configurations' || !item.children?.length) return item

      return {
        ...item,
        children: item.children.filter((child) => {
          if (child.key === 'modulos-list') return canViewModules
          return true
        }),
        active: ({ route }: SidebarMenuContext) => {
          const path = route.path
          if (canViewModules && path.includes('/modulos')) return true
          return path.includes('/superusuarios')
        },
      }
    }),
  }))
}
