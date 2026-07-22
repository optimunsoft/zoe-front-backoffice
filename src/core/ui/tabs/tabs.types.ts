import type { UiIconName } from '~/core/ui/icons'

export type UiTabsVariant = 'simple' | 'underline' | 'icons' | 'container' | 'folder'

export type UiTabItem = {
  key: string
  label: string
  icon?: UiIconName
  disabled?: boolean
  href?: string
}
