import type { DatePeriodId } from '~/shared/constants/date-periods'

export type DateRangeBounds = {
  start: Date
  end: Date
}

const startOfDay = (date: Date) => {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

const endOfDay = (date: Date) => {
  const value = new Date(date)
  value.setHours(23, 59, 59, 999)
  return value
}

const subtractDays = (date: Date, days: number) => {
  const value = new Date(date)
  value.setDate(value.getDate() - days)
  return value
}

const subtractMonths = (date: Date, months: number) => {
  const value = new Date(date)
  value.setMonth(value.getMonth() - months)
  return value
}

export const getDateRangeBounds = (
  periodId: DatePeriodId,
  referenceDate = new Date(),
): DateRangeBounds | null => {
  const end = endOfDay(referenceDate)

  switch (periodId) {
    case 0:
      return { start: startOfDay(referenceDate), end }
    case 1:
      return { start: startOfDay(subtractDays(referenceDate, 6)), end }
    case 2:
      return { start: startOfDay(subtractMonths(referenceDate, 1)), end }
    case 3:
      return { start: startOfDay(subtractMonths(referenceDate, 12)), end }
    case 4:
      return null
    default:
      return null
  }
}

export const isWithinDateRange = (
  value: Date | string | null | undefined,
  bounds: DateRangeBounds | null,
): boolean => {
  if (!bounds) return true

  const date = new Date(value ?? '')
  if (Number.isNaN(date.getTime())) return false

  return date >= bounds.start && date <= bounds.end
}

export const filterItemsByDatePeriod = <T>(
  items: T[],
  periodId: DatePeriodId,
  getDate: (item: T) => Date | string | null | undefined,
): T[] => {
  const bounds = getDateRangeBounds(periodId)
  if (!bounds) return items

  return items.filter((item) => {
    const raw = getDate(item)
    if (raw == null || raw === '') return true

    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) return true

    return date >= bounds.start && date <= bounds.end
  })
}
