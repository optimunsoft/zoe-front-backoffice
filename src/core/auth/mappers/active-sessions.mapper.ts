import type { UTableColumn, UTableRow } from '~/core/ui/Tables/utable.types'
import type { SessionUser } from '../types/auth.types'

export const activeSessionTableColumns: UTableColumn[] = [
  { key: 'loginAt', label: 'Inicio', variant: 'emphasis' },
  { key: 'browser', label: 'Navegador' },
  { key: 'so', label: 'S.O.' },
  { key: 'country', label: 'País' },
  { key: 'city', label: 'Ciudad' },
  { key: 'ip', label: 'IP', variant: 'emphasis' },
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

const formatOptionalText = (value: string | null | undefined) => {
  const trimmed = value?.trim()
  return trimmed || '-'
}

export const mapActiveSessionsToTableRows = (sessions: SessionUser[] | undefined | null): UTableRow[] => {
  if (!Array.isArray(sessions)) return []

  return [...sessions]
    .sort((left, right) => {
      const leftTime = new Date(left.loginAt).getTime()
      const rightTime = new Date(right.loginAt).getTime()

      if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) return 0
      if (Number.isNaN(leftTime)) return 1
      if (Number.isNaN(rightTime)) return -1

      return rightTime - leftTime
    })
    .map((session) => ({
      id: session.id,
      loginAt: formatSessionDateTime(session.loginAt) || '-',
      browser: formatOptionalText(session.browser),
      so: formatOptionalText(session.so),
      country: formatOptionalText(session.country),
      city: formatOptionalText(session.city),
      ip: formatOptionalText(session.ip),
    }))
}
