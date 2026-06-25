import type { RouteLocationNormalizedLoaded } from 'vue-router'

import { sidebarIcons } from './icons'

export type SidebarMenuContext = {
  route: RouteLocationNormalizedLoaded
}

type SidebarMenuResolver<T> = T | ((context: SidebarMenuContext) => T)

export type SidebarMenuItem = {
  key?: string
  label: string
  iconPaths?: string[]
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
        label: 'Dashboard',
        iconPaths: sidebarIcons.dashboard,
        active: ({ route }: SidebarMenuContext) => {
          const id = route.params.iduser
          if (!id) return false

          const base = `/dashboard/${id}`
          return route.path === base || route.path === `${base}/`
        },
        children: [
          {
            key: 'dashboard-home',
            label: 'Inicio',
            to: ({ route }: SidebarMenuContext) => `/dashboard/${route.params.iduser}`,
          },
        ],
      },
      {
        key: 'administration',
        label: 'Administración',
        iconPaths: sidebarIcons.administration,
        active: ({ route }: SidebarMenuContext) => route.path.includes('/administration'),
        children: [
          {
            key: 'administration-list',
            label: 'Lista de administracion',
            to: ({ route }: SidebarMenuContext) => `/dashboard/${route.params.iduser}/administration`,
          },
        ],
      },
      {
        key: 'scheduling',
        label: 'Agendamientos',
        iconPaths: sidebarIcons.scheduling,
        active: ({ route }: SidebarMenuContext) => route.path.includes('/scheduling'),
        children: [
          {
            key: 'scheduling-list',
            label: 'Lista de agendamientos',
            to: ({ route }: SidebarMenuContext) => `/dashboard/${route.params.iduser}/scheduling`,
          },
        ],
      },
    ],
  },
]
