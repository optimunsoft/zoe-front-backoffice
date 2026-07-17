import { normalizeProductInterest } from "../schema/demonstrations.schema";
import type { DemonstrationResponse, DemonstrationStatus } from "../types/demonstration.types";
import type { CalendarEvent, CalendarEventColor } from "~/core/ui/calendar";
import type { UTableColumn, UTableRow } from "~/core/ui/Tables/utable.types";
import { capitalizeFirstLetter, formatTableEmail } from "~/shared/utils/format";

const STATUS_LABELS: Record<DemonstrationStatus, string> = {
    PENDIENTE: 'Pendiente',
    EJECUTADA: 'Ejecutada',
    CANCELADA: 'Cancelada',
}

const STATUS_BADGE_COLORS = {
    Pendiente: 'warning',
    Ejecutada: 'success',
    Cancelada: 'danger',
} as const

const STATUS_CALENDAR_COLORS: Record<DemonstrationStatus, CalendarEventColor> = {
    PENDIENTE: 'yellow',
    EJECUTADA: 'green',
    CANCELADA: 'red',
}

const MONTH_LABELS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
] as const

/** Extrae fecha/hora literal de `scheduledAt` (sin convertir a zona Colombia). */
const parseScheduledAtParts = (value: Date | string) => {
  if (typeof value === 'string') {
    const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/)
    if (match) {
      return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
        hours: Number(match[4]),
        minutes: Number(match[5]),
      }
    }
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null

  // Si ya es Date, usa componentes UTC para respetar el valor del API (...Z).
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
  }
}

const formatDemonstrationDate = (value: Date | string): string => {
  const parts = parseScheduledAtParts(value)
  if (!parts) return '-'

  const monthLabel = MONTH_LABELS_SHORT[parts.month - 1] ?? ''
  return `${parts.day} De ${capitalizeFirstLetter(monthLabel)} ${parts.year}`
}

const formatDemonstrationTime = (value: Date | string): string => {
  const parts = parseScheduledAtParts(value)
  if (!parts) return '-'

  const period = parts.hours >= 12 ? 'p. m.' : 'a. m.'
  const hour12 = parts.hours % 12 || 12
  const minutes = String(parts.minutes).padStart(2, '0')

  return `${hour12}:${minutes} ${period}`
}

const formatDemonstrationPhone = (value?: string | null): string => {
  if (!value?.trim()) return '-'

  const withoutCountryCode = value.trim().replace(/^\+?57\s*/, '')
  const digits = withoutCountryCode.replace(/\D/g, '')

  return digits || '-'
}

export const demonstrationColumns: UTableColumn[] = [
  { key: 'name', label: 'Nombre', toggleable: false, variant: 'emphasis' },
  { key: 'email', label: 'Email' },
  { key: 'scheduledDate', label: 'Fecha' },
  { key: 'scheduledTime', label: 'Hora' },
  { key: 'phone', label: 'Teléfono' },
  {
    key: 'productInterest',
    label: 'Productos de interés',
    type: 'badge',
    align: 'left',
    badgeColorFallback: 'info',
  },
  {
    key: 'status',
    label: 'Estado',
    type: 'badge',
    align: 'center',
    badgeColorMap: STATUS_BADGE_COLORS,
  },
]

export const mapDemonstrationsToTableRows = (demonstrations: DemonstrationResponse[]): UTableRow[] => {
  return demonstrations.map((demonstration) => ({
    id: demonstration.id,
    name: demonstration.name,
    email: formatTableEmail(demonstration.email),
    scheduledDate: formatDemonstrationDate(demonstration.scheduledAt),
    scheduledTime: formatDemonstrationTime(demonstration.scheduledAt),
    phone: formatDemonstrationPhone(demonstration.phone),
    productInterest: normalizeProductInterest(demonstration.productInterest),
    status: STATUS_LABELS[demonstration.status] ?? demonstration.status,
  }))
}

export const mapDemonstrationsToCalendarEvents = (
  demonstrations: DemonstrationResponse[],
): CalendarEvent[] =>
  demonstrations
    .map((demonstration) => {
      const parts = parseScheduledAtParts(demonstration.scheduledAt)
      if (!parts) return null

      const start = new Date(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hours,
        parts.minutes,
      )
      const end = new Date(start)
      end.setHours(end.getHours() + 1)

      const statusLabel = STATUS_LABELS[demonstration.status] ?? demonstration.status

      return {
        id: demonstration.id,
        eventName: `${demonstration.name} · ${statusLabel}`,
        eventStart: start,
        eventEnd: end,
        eventColor: STATUS_CALENDAR_COLORS[demonstration.status] ?? 'sky',
      } satisfies CalendarEvent
    })
    .filter((event): event is CalendarEvent => event != null)
