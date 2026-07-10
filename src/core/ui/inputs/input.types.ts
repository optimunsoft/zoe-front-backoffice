export type InputSize = 'sm' | 'md' | 'lg'

export type InputState = 'default' | 'error' | 'success'

export type InputSelectOption = {
  label: string
  value: string | number
  disabled?: boolean
  selectedLabel?: string
}
