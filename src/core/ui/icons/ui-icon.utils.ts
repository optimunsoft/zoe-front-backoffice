import { uiIcons, type UiIconName } from './ui-icons'
import type { UiIconDefinition } from './ui-icon.types'

export const getUiIcon = (name: UiIconName): UiIconDefinition => uiIcons[name]

export const resolveUiIcon = (name?: UiIconName | string): UiIconDefinition | undefined => {
  if (!name) return undefined
  if (name in uiIcons) return uiIcons[name as UiIconName]
  return undefined
}

export const resolveUiIconPaths = (name?: UiIconName | string): string[] =>
  resolveUiIcon(name)?.paths ?? []

export const resolveUiIconName = (
  icon?: UiIconName,
  fallbackKey?: string,
): UiIconName | undefined => {
  if (icon) return icon
  if (fallbackKey && fallbackKey in uiIcons) return fallbackKey as UiIconName
  return undefined
}
