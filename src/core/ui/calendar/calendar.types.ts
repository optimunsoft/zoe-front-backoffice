export type CalendarEventColor = 'sky' | 'indigo' | 'yellow' | 'green' | 'red' | 'violet'

export type CalendarViewMode = 'month' | 'week' | 'day'

export type CalendarEvent = {
  id?: string | number
  eventName: string
  eventStart: Date
  eventEnd?: Date | null
  eventColor?: CalendarEventColor
}

export type CalendarFilterOption = {
  key: string
  label: string
  colorClass: string
}

export const CALENDAR_EVENT_COLOR_CLASSES: Record<CalendarEventColor, string> = {
  sky: 'text-white bg-sky-500',
  indigo: 'text-white bg-violet-500',
  violet: 'text-white bg-violet-500',
  yellow: 'text-white bg-yellow-500',
  green: 'text-white bg-green-500',
  red: 'text-white bg-red-500',
}

export const CALENDAR_MONTH_NAMES_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const

export const CALENDAR_DAY_NAMES_ES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const
