import type { UiTabsVariant } from './tabs.types'

export const getTabsListClasses = (variant: UiTabsVariant): string => {
  switch (variant) {
    case 'container':
      return 'flex flex-wrap -m-1'
    case 'underline':
      return 'relative text-sm font-medium flex flex-nowrap -mx-4 sm:-mx-6 lg:-mx-8 overflow-x-scroll no-scrollbar'
    case 'icons':
    case 'simple':
    default:
      return 'text-sm font-medium flex flex-nowrap -mx-4 sm:-mx-6 lg:-mx-8 overflow-x-scroll no-scrollbar'
  }
}

export const getTabsItemClasses = (variant: UiTabsVariant): string => {
  switch (variant) {
    case 'container':
      return 'm-1'
    case 'underline':
      return 'mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8'
    case 'icons':
    case 'simple':
    default:
      return 'pb-3 mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8'
  }
}

export const getTabsTriggerClasses = (
  variant: UiTabsVariant,
  active: boolean,
  disabled = false,
): string => {
  if (variant === 'container') {
    const base = 'inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border shadow-xs transition'
    if (disabled) {
      return `${base} border-gray-200 dark:border-gray-700/60 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed`
    }
    if (active) {
      return `${base} border-transparent bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-800`
    }
    return `${base} border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400`
  }

  if (variant === 'underline') {
    const base = 'block pb-3 whitespace-nowrap border-b-2 transition'
    if (disabled) {
      return `${base} border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed`
    }
    if (active) {
      return `${base} text-violet-500 border-violet-500`
    }
    return `${base} border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`
  }

  const base = variant === 'icons'
    ? 'whitespace-nowrap flex items-center transition'
    : 'whitespace-nowrap transition'

  if (disabled) {
    return `${base} text-gray-400 dark:text-gray-600 cursor-not-allowed`
  }
  if (active) {
    return `${base} text-violet-500`
  }
  return `${base} text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`
}

export const getTabsWrapperClasses = (variant: UiTabsVariant): string => {
  switch (variant) {
    case 'container':
      return ''
    case 'underline':
      return 'relative'
    case 'icons':
    case 'simple':
    default:
      return 'border-b border-gray-200 dark:border-gray-700/60'
  }
}
