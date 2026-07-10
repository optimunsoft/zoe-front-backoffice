export const formatPhonePrefixLabel = (prefix: string) => {
  const digits = prefix.trim().replace(/^\+/, '')
  if (!digits) return ''

  return `+${digits}`
}

export const DEFAULT_PHONE_PREFIX = '57'

export const normalizePhonePrefixDigits = (prefix: string) =>
  prefix.trim().replace(/^\+/, '')

export const resolveDefaultPhonePrefix = (
  countries: Array<{ phonePrefix: string }>,
) => {
  const match = countries.find((country) =>
    normalizePhonePrefixDigits(country.phonePrefix) === DEFAULT_PHONE_PREFIX,
  )

  return normalizePhonePrefixDigits(match?.phonePrefix ?? DEFAULT_PHONE_PREFIX)
}

export const resolvePhonePrefixOption = (
  prefix: string,
  countries: Array<{ phonePrefix: string }> = [],
) => {
  const normalized = normalizePhonePrefixDigits(prefix)
  if (!normalized) {
    return resolveDefaultPhonePrefix(countries)
  }

  const match = countries.find((country) =>
    normalizePhonePrefixDigits(country.phonePrefix) === normalized,
  )

  if (match) {
    return normalizePhonePrefixDigits(match.phonePrefix)
  }

  return normalized
}
