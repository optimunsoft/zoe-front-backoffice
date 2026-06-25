import type { TooltipBg, TooltipPosition, TooltipSize } from './tooltip.types'

export function getTooltipPositionOuterClasses(position: TooltipPosition = 'top'): string {
  switch (position) {
    case 'right':
      return 'left-full top-1/2 -translate-y-1/2'
    case 'left':
      return 'right-full top-1/2 -translate-y-1/2'
    case 'bottom':
      return 'top-full left-1/2 -translate-x-1/2'
    default:
      return 'bottom-full left-1/2 -translate-x-1/2'
  }
}

export function getTooltipPositionInnerClasses(position: TooltipPosition = 'top'): string {
  switch (position) {
    case 'right':
      return 'ml-2'
    case 'left':
      return 'mr-2'
    case 'bottom':
      return 'mt-2'
    default:
      return 'mb-2'
  }
}

export function getTooltipSizeClasses(size: TooltipSize = 'default'): string {
  switch (size) {
    case 'lg':
      return 'min-w-72 px-3 py-2'
    case 'md':
      return 'min-w-56 px-3 py-2'
    case 'sm':
      return 'min-w-44 px-3 py-2'
    default:
      return 'px-3 py-2'
  }
}

export function getTooltipColorClasses(bg: TooltipBg = 'default'): string {
  switch (bg) {
    case 'light':
      return 'bg-white text-gray-600 border-gray-200'
    case 'dark':
      return 'bg-gray-800 text-gray-100 border-gray-700/60'
    default:
      return 'text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700/60'
  }
}
