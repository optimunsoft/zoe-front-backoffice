import type { UTableColumn, UTableRow } from '~/core/ui/Tables/utable.types'
import type { UserSession } from '../types/users.types'

export const userSessionTableColumns: UTableColumn[] = [
  { key: 'loginAt', label: 'Inicio', variant: 'emphasis' },
  { key: 'logoutAt', label: 'Cierre' },
  { key: 'device', label: 'Dispositivo' },
  { key: 'browser', label: 'Navegador' },
  { key: 'operatingSystem', label: 'S.O.' },
  { key: 'ip', label: 'IP', variant: 'emphasis' },
  { key: 'location', label: 'Ubicación' },
]

const formatSessionDateTime = (value: string | null | undefined) => {
  if (!value?.trim()) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export const formatSessionLoginAt = (session: UserSession) =>
  formatSessionDateTime(session.loginAt) || '-'

export const formatSessionLogoutAt = (session: UserSession) => {
  if (session.logoutAt?.trim()) {
    return formatSessionDateTime(session.logoutAt)
  }

  if (session.revoked) return 'Revocada'
  return 'Activa'
}

export const formatSessionDevice = (session: UserSession) => {
  const device = session.device?.trim()
  return device || '-'
}

export const formatSessionBrowser = (session: UserSession) => {
  const browser = session.browser?.trim()
  return browser || '-'
}

export const formatSessionOperatingSystem = (session: UserSession) => {
  const operatingSystem = session.operatingSystem?.trim()
  return operatingSystem || '-'
}

export const formatSessionIp = (session: UserSession) => {
  const ip = session.ip?.trim()
  return ip || '-'
}

export const formatSessionLocation = (session: UserSession) => {
  const city = session.city?.trim()
  const country = session.country?.trim()
  const parts = [city, country].filter(Boolean)

  return parts.length > 0 ? parts.join(', ') : '-'
}

const resolveLogoutAtBadge = (session: UserSession) => {
  if (session.logoutAt?.trim()) return null
  if (session.revoked) return 'danger' as const
  return 'success' as const
}

export const getVisibleUserSessions = (sessions: UserSession[] | undefined | null) => {
  if (!Array.isArray(sessions)) return []

  return [...sessions].sort((left, right) => {
    const leftTime = new Date(left.loginAt).getTime()
    const rightTime = new Date(right.loginAt).getTime()

    if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) return 0
    if (Number.isNaN(leftTime)) return 1
    if (Number.isNaN(rightTime)) return -1

    return rightTime - leftTime
  })
}

export const mapUserSessionsToTableRows = (sessions: UserSession[] | undefined | null): UTableRow[] =>
  getVisibleUserSessions(sessions).map((session) => ({
    id: session.id,
    loginAt: formatSessionLoginAt(session),
    logoutAt: formatSessionLogoutAt(session),
    logoutAtBadge: resolveLogoutAtBadge(session),
    device: formatSessionDevice(session),
    browser: formatSessionBrowser(session),
    operatingSystem: formatSessionOperatingSystem(session),
    ip: formatSessionIp(session),
    location: formatSessionLocation(session),
  }))
