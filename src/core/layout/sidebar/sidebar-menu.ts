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
        active: ({ route }: SidebarMenuContext) =>
          route.path.includes('/empresas') || route.path.includes('/usuarios') || route.path.includes('/modulos'),
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
          {
            key: 'modulos-list',
            label: 'Módulos',
            to: `${BACKOFFICE_DASHBOARD_PATH}/modulos`,
          },
        ],
      },
      {
        key: 'scheduling',
        label: 'Agendamientos',
        icon: 'scheduling',
        to: `${BACKOFFICE_DASHBOARD_PATH}/demonstrations`,
        active: ({ route }: SidebarMenuContext) => route.path.includes('/demonstrations'),

      },
    ],
  },
]
