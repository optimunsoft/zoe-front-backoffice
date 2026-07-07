import type { SidebarMenuContext, SidebarMenuItem, SidebarMenuSection } from './sidebar-menu'
import type { UiIconName } from '~/core/ui/icons'

export type SidebarMenuSearchItem = {
  key: string
  label: string
  to: string
  section: string
  group?: string
  icon?: UiIconName
}

const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const resolveMenuValue = <T>(value: T | ((context: SidebarMenuContext) => T) | undefined, context: SidebarMenuContext) => {
  if (value === undefined) return undefined
  if (typeof value === 'function') return value(context)
  return value
}

const collectNavigableItems = (
  items: SidebarMenuItem[],
  sectionTitle: string,
  context: SidebarMenuContext,
  parentLabel?: string,
): SidebarMenuSearchItem[] => {
  const result: SidebarMenuSearchItem[] = []

  for (const item of items) {
    const to = resolveMenuValue(item.to, context)

    if (to) {
      result.push({
        key: item.key || `${sectionTitle}-${item.label}`,
        label: item.label,
        to,
        section: sectionTitle,
        group: parentLabel,
        icon: item.icon,
      })
    }

    if (item.children?.length) {
      result.push(...collectNavigableItems(item.children, sectionTitle, context, item.label))
    }
  }

  return result
}

export const flattenSidebarMenuForSearch = (
  sections: SidebarMenuSection[],
  context: SidebarMenuContext,
): SidebarMenuSearchItem[] =>
  sections.flatMap((section) => collectNavigableItems(section.items, section.title, context))

export const filterSidebarMenuSearch = (
  items: SidebarMenuSearchItem[],
  query: string,
): SidebarMenuSearchItem[] => {
  const normalizedQuery = normalizeSearchText(query.trim())
  if (!normalizedQuery) return items

  return items.filter((item) => {
    const haystack = normalizeSearchText([item.label, item.group, item.section].filter(Boolean).join(' '))
    return haystack.includes(normalizedQuery)
  })
}

export const groupSidebarMenuSearchItems = (
  items: SidebarMenuSearchItem[],
): { title: string; items: SidebarMenuSearchItem[] }[] => {
  const groups = new Map<string, SidebarMenuSearchItem[]>()

  for (const item of items) {
    const existing = groups.get(item.section) ?? []
    existing.push(item)
    groups.set(item.section, existing)
  }

  return [...groups.entries()].map(([title, groupItems]) => ({ title, items: groupItems }))
}
