export function capitalizeFirstLetter(value: string): string {
  const text = value?.trim() ?? ''
  if (!text) return ''

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function toTitleCase(value: string): string {
  const text = value?.trim() ?? ''
  if (!text) return ''

  return text
    .toLowerCase()
    .replace(/\p{L}[\p{L}\p{M}'’-]*/gu, word =>
      word.charAt(0).toUpperCase() + word.slice(1),
    )
}

const shouldPreserveTableText = (value: string) => {
  const text = value.trim()
  if (!text || text === '-') return true
  if (text.includes('@')) return true
  if (/^\+?\d[\d\s().-]{5,}$/.test(text)) return true
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(text)) return true
  if (/^\d{1,2}:\d{2}(\s?[ap]\.?\s?m\.?)?$/i.test(text)) return true

  return false
}

/** Formato estándar de celdas de tabla: Primera Mayúscula por palabra. */
export function formatTableText(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)

  const text = String(value).trim()
  if (!text) return ''
  if (shouldPreserveTableText(text)) return text

  return toTitleCase(text)
}
