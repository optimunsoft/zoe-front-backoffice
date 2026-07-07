import type { UiIconName } from '~/core/ui/icons'

export type SettingsNavItem = {
  key: string
  label: string
  group?: string
  icon?: UiIconName
  badge?: string | number
}

export type SettingsNavGroup = {
  title: string
  items: SettingsNavItem[]
}
