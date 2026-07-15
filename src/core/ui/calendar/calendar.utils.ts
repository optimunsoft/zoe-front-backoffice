import type { CalendarEvent, CalendarEventColor } from './calendar.types'
import { CALENDAR_EVENT_COLOR_CLASSES } from './calendar.types'

export type CalendarMonthGrid = {
  daysInMonth: number[]
  startingBlankDays: number[]
  endingBlankDays: number[]
}

export const buildCalendarMonthGrid = (year: number, month: number): CalendarMonthGrid => {
  const daysCount = new Date(year, month + 1, 0).getDate()
  const startingDayOfWeek = new Date(year, month, 1).getDay()
  const endingDayOfWeek = new Date(year, month + 1, 0).getDay()

  const startingBlankDays = Array.from({ length: startingDayOfWeek }, (_, index) => index + 1)
  const endingBlankCount = Math.max(0, 6 - endingDayOfWeek)
  const endingBlankDays = Array.from({ length: endingBlankCount }, (_, index) => index + 1)
  const daysInMonth = Array.from({ length: daysCount }, (_, index) => index + 1)

  return {
    daysInMonth,
    startingBlankDays,
    endingBlankDays,
  }
}

export const startOfDay = (value: Date) => {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

export const addDays = (value: Date, amount: number) => {
  const date = new Date(value)
  date.setDate(date.getDate() + amount)
  return date
}

export const getWeekDates = (value: Date): Date[] => {
  const start = startOfDay(value)
  start.setDate(start.getDate() - start.getDay())

  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

export const isSameCalendarDay = (left: Date, year: number, month: number, day: number) => {
  const right = new Date(year, month, day)
  return left.toDateString() === right.toDateString()
}

export const isSameDate = (left: Date, right: Date) =>
  left.toDateString() === right.toDateString()

export const isToday = (year: number, month: number, day: number, today = new Date()) =>
  isSameCalendarDay(today, year, month, day)

export const isTodayDate = (value: Date, today = new Date()) =>
  isSameDate(value, today)

export const getEventsForDay = (
  events: CalendarEvent[],
  year: number,
  month: number,
  day: number,
) =>
  events.filter((event) =>
    isSameCalendarDay(new Date(event.eventStart), year, month, day),
  )

export const getEventsForDate = (events: CalendarEvent[], date: Date) =>
  events
    .filter((event) => isSameDate(new Date(event.eventStart), date))
    .sort((left, right) =>
      new Date(left.eventStart).getTime() - new Date(right.eventStart).getTime(),
    )

export const resolveEventColorClass = (color?: CalendarEventColor) => {
  if (!color) return CALENDAR_EVENT_COLOR_CLASSES.sky
  return CALENDAR_EVENT_COLOR_CLASSES[color] ?? CALENDAR_EVENT_COLOR_CLASSES.sky
}

export const formatEventTime = (value?: Date | null) => {
  if (!value) return ''
  return value.toLocaleTimeString('es-CO', {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
  })
}

export const formatWeekTitle = (weekDates: Date[]) => {
  if (!weekDates.length) return ''

  const first = weekDates[0]!
  const last = weekDates[weekDates.length - 1]!
  const sameMonth = first.getMonth() === last.getMonth()
  const sameYear = first.getFullYear() === last.getFullYear()

  const firstLabel = first.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: sameMonth && sameYear ? undefined : 'short',
  })
  const lastLabel = last.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `${firstLabel} - ${lastLabel}`
}

export const formatDayTitle = (value: Date) =>
  value.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
