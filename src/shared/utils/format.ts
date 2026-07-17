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

/**
 * Fecha de tabla: `18 De Jun 2026`.
 */
export function formatTableDate(
  value: Date | string | null | undefined,
  empty = '-',
): string {
  if (value == null) return empty

  const raw = value instanceof Date ? value : String(value).trim()
  if (!raw) return empty

  const date = raw instanceof Date ? raw : new Date(raw)
  if (Number.isNaN(date.getTime())) return empty

  const day = date.getDate()
  const month = new Intl.DateTimeFormat('es-CO', { month: 'short' })
    .format(date)
    .replace(/\.$/, '')
  const year = date.getFullYear()

  return `${day} De ${capitalizeFirstLetter(month)} ${year}`
}

const shouldPreserveTableText = (value: string) => {
  const text = value.trim()
  if (!text || text === '-') return true
  if (/^\+?\d[\d\s().-]{5,}$/.test(text)) return true
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(text)) return true
  if (/^\d{1,2}\s+De\s+\p{L}+\s+\d{4}$/u.test(text)) return true
  if (/^\d{1,2}:\d{2}(\s?[ap]\.?\s?m\.?)?$/i.test(text)) return true

  return false
}

/** Formato estándar de emails en tablas: siempre minúsculas. */
export function formatTableEmail(value: unknown, empty = '-'): string {
  if (value == null) return empty

  const text = String(value).trim()
  if (!text || text === '-') return empty

  return text.toLowerCase()
}

/** Formato estándar de celdas de tabla: Primera Mayúscula por palabra. */
export function formatTableText(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)

  const text = String(value).trim()
  if (!text) return ''

  if (text.includes('@')) return formatTableEmail(text, text)

  if (shouldPreserveTableText(text)) return text

  return toTitleCase(text)
}
