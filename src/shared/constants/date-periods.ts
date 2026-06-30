export type DatePeriodId = 0 | 1 | 2 | 3 | 4

export const DATE_PERIOD_DEFAULT: DatePeriodId = 2

export const DATE_PERIOD_OPTIONS: Array<{ id: DatePeriodId, period: string }> = [
  { id: 0, period: 'Hoy' },
  { id: 1, period: 'Últimos 7 días' },
  { id: 2, period: 'Último mes' },
  { id: 3, period: 'Últimos 12 meses' },
  { id: 4, period: 'Todo el tiempo' },
]
