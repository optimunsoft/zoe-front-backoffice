import type { SessionUser } from '../types/auth.types'

const SESSIONS_ASSETS_BASE = '/images/auth/sessions'
const EMPTY_CELL = '—'

export type SessionBrowserAsset = {
  src: string | null
  label: string
  useGlobe: boolean
}

export type SessionOsAsset = {
  src: string | null
  label: string
}

export type ActiveSessionCard = {
  id: string
  browser: SessionBrowserAsset
  os: SessionOsAsset
  location: string
  loginAt: string
  ip: string
}

const formatOptionalText = (value: string | null | undefined) => {
  const trimmed = value?.trim()
  return trimmed || EMPTY_CELL
}

const formatSessionDateTime = (value: string | null | undefined) => {
  if (!value?.trim()) return EMPTY_CELL

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const dayMonthYear = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)

  const time = new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)

  return `${dayMonthYear} • ${time}`
}

const formatSessionIp = (value: string | null | undefined) => {
  const trimmed = value?.trim()
  if (!trimmed) return EMPTY_CELL
  return `IP ${trimmed}`
}

const resolveBrowserAsset = (browser: string | null | undefined): SessionBrowserAsset => {
  const label = formatOptionalText(browser)
  const normalized = browser?.trim().toLowerCase() ?? ''

  if (normalized.includes('chrome')) {
    return { src: `${SESSIONS_ASSETS_BASE}/chrome.png`, label, useGlobe: false }
  }

  if (normalized.includes('firefox')) {
    return { src: `${SESSIONS_ASSETS_BASE}/firefox.png`, label, useGlobe: false }
  }

  return { src: null, label, useGlobe: true }
}

const resolveOsAsset = (so: string | null | undefined): SessionOsAsset => {
  const label = formatOptionalText(so)
  const normalized = so?.trim().toLowerCase() ?? ''

  if (normalized.includes('windows')) {
    return { src: `${SESSIONS_ASSETS_BASE}/Windows.png`, label }
  }

  if (
    normalized.includes('ios')
    || normalized.includes('macos')
    || normalized.includes('mac os')
    || normalized.includes('iphone')
    || normalized.includes('ipad')
    || normalized === 'mac'
  ) {
    return { src: `${SESSIONS_ASSETS_BASE}/ios.png`, label }
  }

  if (normalized.includes('android')) {
    return { src: `${SESSIONS_ASSETS_BASE}/android.png`, label }
  }

  if (normalized.includes('linux')) {
    return { src: `${SESSIONS_ASSETS_BASE}/linux.png`, label }
  }

  return { src: null, label }
}

const formatLocation = (city: string | null | undefined, country: string | null | undefined) => {
  const cityText = city?.trim()
  const countryText = country?.trim()

  if (cityText && countryText) return `${cityText}, ${countryText}`
  if (cityText) return cityText
  if (countryText) return countryText
  return EMPTY_CELL
}

export const mapActiveSessionsToCards = (
  sessions: SessionUser[] | undefined | null,
): ActiveSessionCard[] => {
  if (!Array.isArray(sessions)) return []

  return sessions.map((session) => ({
    id: session.id,
    browser: resolveBrowserAsset(session.browser),
    os: resolveOsAsset(session.so),
    location: formatLocation(session.city, session.country),
    loginAt: formatSessionDateTime(session.loginAt),
    ip: formatSessionIp(session.ip),
  }))
}
