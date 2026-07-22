import type { InputSize, InputState } from './input.types'

/** Same class strings previously inlined in InputText — do not change without visual review. */
export const getInputSizeClass = (size: InputSize = 'md'): string => {
  if (size === 'sm') return 'px-2 py-1'
  if (size === 'lg') return 'px-4 py-3'
  return ''
}

export const getInputStateClass = (state: InputState = 'default'): string => {
  if (state === 'error') return 'border-red-300'
  if (state === 'success') return 'border-green-300'
  return ''
}

export const getInputDisabledClass = (disabled = false): string => {
  if (!disabled) return ''
  return 'dark:disabled:placeholder:text-gray-600 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed shadow-none'
}
