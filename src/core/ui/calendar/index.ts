export { default as UCalendar } from './Calendar.vue'
export { default as Calendar } from './Calendar.vue'
export type {
  CalendarEvent,
  CalendarEventColor,
  CalendarFilterOption,
  CalendarViewMode,
} from './calendar.types'
export {
  CALENDAR_DAY_NAMES_ES,
  CALENDAR_EVENT_COLOR_CLASSES,
  CALENDAR_MONTH_NAMES_ES,
} from './calendar.types'
export {
  addDays,
  buildCalendarMonthGrid,
  formatDayTitle,
  formatEventTime,
  formatWeekTitle,
  getEventsForDate,
  getEventsForDay,
  getWeekDates,
  isToday,
  isTodayDate,
  resolveEventColorClass,
  startOfDay,
} from './calendar.utils'
