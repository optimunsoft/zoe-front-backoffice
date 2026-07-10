const ALLOWED_CONTROL_KEYS = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
])

export const sanitizeDigitsInput = (value: string, maxLength?: number) => {
  const digits = value.replace(/\D/g, '')
  return maxLength ? digits.slice(0, maxLength) : digits
}

export const isAllowedDigitsOnlyKey = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return true
  if (ALLOWED_CONTROL_KEYS.has(event.key)) return true
  return /^\d$/.test(event.key)
}

export const blockNonDigitKeydown = (event: KeyboardEvent) => {
  if (!isAllowedDigitsOnlyKey(event)) {
    event.preventDefault()
  }
}

export const extractDigitsFromClipboard = (
  event: ClipboardEvent,
  maxLength?: number,
) => sanitizeDigitsInput(event.clipboardData?.getData('text') ?? '', maxLength)
