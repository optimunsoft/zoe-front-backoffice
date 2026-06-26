/** Apariencia visual predefinida (Mosaic). Tiene prioridad sobre `color` + `appearance`. */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'danger'
  | 'danger-outline'
  | 'success'
  | 'success-outline'

/** Paleta combinable con `appearance` cuando no se usa `variant`. */
export type ButtonColor = 'primary' | 'neutral' | 'danger' | 'success' | 'violet'

export type ButtonAppearance = 'solid' | 'outline'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export type ButtonIconPosition = 'left' | 'right'

export type ButtonNativeType = 'button' | 'submit' | 'reset'
2