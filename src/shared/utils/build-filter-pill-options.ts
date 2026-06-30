import type { FilterPillOption } from '~/core/ui/filters/filter-pills.types'

type BuildFilterPillOptionsParams<T> = {
  items: T[]
  options: Array<{
    key: string
    label: string
    match?: (item: T) => boolean
  }>
}

export const buildFilterPillOptions = <T>({
  items,
  options,
}: BuildFilterPillOptionsParams<T>): FilterPillOption[] => {
  return options.map((option) => ({
    key: option.key,
    label: option.label,
    count: option.match ? items.filter(option.match).length : items.length,
  }))
}

export const filterItemsByPill = <T>(
  items: T[],
  selectedKey: string,
  allKey = 'all',
  matchByKey: Record<string, (item: T) => boolean>,
): T[] => {
  if (selectedKey === allKey) return items

  const matcher = matchByKey[selectedKey]
  if (!matcher) return items

  return items.filter(matcher)
}
