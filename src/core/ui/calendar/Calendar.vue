<template>
  <div
    class="w-full"
    :class="fitHeight ? 'flex min-h-0 flex-col' : ''"
    :style="rootStyle"
  >
    <div
      class="shrink-0 sm:flex sm:items-center sm:justify-between sm:gap-4"
      :class="fitHeight ? 'mb-2' : 'mb-3 sm:mb-4'"
    >
      <div :class="fitHeight ? 'mb-1 sm:mb-0' : 'mb-3 sm:mb-0'">
        <h2
          class="font-bold capitalize text-gray-800 dark:text-gray-100"
          :class="fitHeight ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'"
        >
          <span>{{ titleLabel }}</span>
        </h2>
      </div>

      <div class="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
        <div
          class="flex flex-nowrap -space-x-px"
          role="group"
          aria-label="Vista del calendario"
        >
          <button
            v-for="mode in viewModes"
            :key="mode"
            type="button"
            class="btn rounded-none border-gray-200 bg-white first:rounded-l-lg last:rounded-r-lg dark:border-gray-700/60 dark:bg-gray-800"
            :class="viewMode === mode
              ? 'text-violet-500'
              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900'"
            @click="setViewMode(mode)"
          >
            {{ viewModeLabels[mode] }}
          </button>
        </div>

        <button
          type="button"
          class="btn px-2.5 border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-600 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
          :aria-label="previousNavLabel"
          @click="goToPrevious"
        >
          <span class="sr-only">{{ previousNavLabel }}</span>
          <svg class="fill-current text-gray-400 dark:text-gray-500" width="16" height="16" viewBox="0 0 16 16">
            <path d="M9.4 13.4l1.4-1.4-4-4 4-4-1.4-1.4L4 8z" />
          </svg>
        </button>

        <button
          type="button"
          class="btn px-2.5 border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-600 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
          :aria-label="nextNavLabel"
          @click="goToNext"
        >
          <span class="sr-only">{{ nextNavLabel }}</span>
          <svg class="fill-current text-gray-400 dark:text-gray-500" width="16" height="16" viewBox="0 0 16 16">
            <path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z" />
          </svg>
        </button>

        <hr
          v-if="showCreateButton"
          class="mx-1 hidden h-8 w-px border-none bg-gray-200 sm:block dark:bg-gray-700/60"
        >

        <button
          v-if="showCreateButton"
          type="button"
          class="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
          @click="emit('create-event')"
        >
          {{ createLabel }}
        </button>
      </div>
    </div>

    <div
      v-if="filters.length"
      class="mb-3 shrink-0 sm:mb-4"
    >
      <ul class="flex flex-wrap items-center -m-1">
        <li
          v-for="filter in filters"
          :key="filter.key"
          class="m-1"
        >
          <button
            type="button"
            class="btn-sm border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600"
            :class="activeFilterKey === filter.key ? 'ring-1 ring-brand-500/40' : ''"
            @click="toggleFilter(filter.key)"
          >
            <div
              class="h-3.5 w-1 shrink-0"
              :class="filter.colorClass"
            />
            <span class="ml-1.5">{{ filter.label }}</span>
          </button>
        </li>

        <li
          v-if="showAddFilterButton"
          class="m-1"
        >
          <button
            type="button"
            class="btn-sm border-gray-200 bg-white text-violet-500 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600"
            @click="emit('add-filter')"
          >
            {{ addFilterLabel }}
          </button>
        </li>
      </ul>
    </div>

    <div
      class="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800"
      :class="fitHeight ? 'flex min-h-0 flex-1 flex-col' : ''"
    >
      <!-- Month / Week headers -->
      <div
        v-if="viewMode !== 'day'"
        class="grid shrink-0 grid-cols-7 gap-px border-b border-gray-200 dark:border-gray-700/60"
      >
        <div
          v-for="(dayName, index) in dayNames"
          :key="index"
          class="px-1 py-2"
        >
          <div class="text-center text-sm font-medium text-gray-500 lg:hidden">
            {{ dayName.substring(0, 3) }}
          </div>
          <div class="hidden text-center text-sm font-medium text-gray-500 lg:block dark:text-gray-400">
            {{ dayName }}
          </div>
        </div>
      </div>

      <!-- Month view -->
      <div
        v-if="viewMode === 'month'"
        class="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700/60"
        :class="fitHeight ? 'min-h-0 flex-1 auto-rows-fr' : ''"
      >
        <svg class="sr-only">
          <defs>
            <pattern
              id="utable-calendar-stripes"
              patternUnits="userSpaceOnUse"
              width="5"
              height="5"
              patternTransform="rotate(135)"
            >
              <line
                class="stroke-current text-gray-200 opacity-50 dark:text-gray-700"
                x1="0"
                y="0"
                x2="0"
                y2="5"
                stroke-width="2"
              />
            </pattern>
          </defs>
        </svg>

        <div
          v-for="blankday in startingBlankDays"
          :key="`start-${blankday}`"
          :class="blankDayCellClass"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <rect width="100%" height="100%" fill="url(#utable-calendar-stripes)" />
          </svg>
        </div>

        <div
          v-for="day in daysInMonth"
          :key="`day-${day}`"
          class="relative cursor-pointer overflow-hidden bg-white dark:bg-gray-800"
          :class="dayCellClass"
          @click="openDayView(day)"
        >
          <div class="flex h-full min-h-0 flex-col justify-between">
            <div class="relative flex min-h-0 grow flex-col overflow-hidden p-0.5 sm:p-1">
              <button
                v-for="(event, eventIndex) in getVisibleMonthEvents(day)"
                :key="event.id ?? `${day}-${eventIndex}`"
                type="button"
                class="relative mb-0.5 w-full cursor-pointer text-left"
                @click.stop="emit('event-click', event)"
              >
                <div
                  class="overflow-hidden rounded-md px-1.5 py-0.5"
                  :class="resolveEventColorClass(event.eventColor)"
                >
                  <div class="truncate text-[11px] font-semibold leading-tight sm:text-xs">
                    {{ event.eventName }}
                  </div>
                  <div class="truncate text-[10px] uppercase leading-tight sm:text-xs">
                    <span v-if="event.eventStart">{{ formatEventTime(event.eventStart) }}</span>
                    <span v-if="event.eventEnd">
                      - <span>{{ formatEventTime(event.eventEnd) }}</span>
                    </span>
                  </div>
                </div>
              </button>
            </div>

            <div class="flex shrink-0 items-center justify-between p-0.5 sm:p-1">
              <button
                v-if="getMonthDayEvents(day).length > maxVisibleEvents"
                type="button"
                class="cursor-pointer whitespace-nowrap rounded-md border border-gray-200 px-0.5 text-center text-[10px] font-medium text-gray-500 sm:px-1.5 sm:text-xs dark:border-gray-700/60 dark:text-gray-300"
                @click.stop="openDayView(day)"
              >
                <span class="md:hidden">+</span>
                <span>{{ getMonthDayEvents(day).length - maxVisibleEvents }}</span>
                <span class="hidden md:inline"> más</span>
              </button>

              <button
                type="button"
                class="ml-auto inline-flex size-5 cursor-pointer items-center justify-center rounded-full text-center text-[11px] font-medium hover:bg-violet-100 sm:size-6 sm:text-sm dark:text-gray-300 dark:hover:bg-gray-600"
                :class="{ 'text-violet-500': isToday(year, month, day) }"
                @click.stop="openDayView(day)"
              >
                {{ day }}
              </button>
            </div>
          </div>
        </div>

        <div
          v-for="blankday in endingBlankDays"
          :key="`end-${blankday}`"
          :class="blankDayCellClass"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <rect width="100%" height="100%" fill="url(#utable-calendar-stripes)" />
          </svg>
        </div>
      </div>

      <!-- Week view -->
      <div
        v-else-if="viewMode === 'week'"
        class="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700/60"
        :class="fitHeight ? 'min-h-0 flex-1' : 'min-h-64'"
      >
        <div
          v-for="date in weekDates"
          :key="date.toISOString()"
          class="relative flex min-h-0 cursor-pointer flex-col overflow-hidden bg-white dark:bg-gray-800"
          :class="fitHeight ? 'h-full' : 'min-h-64'"
          @click="openDayViewFromDate(date)"
        >
          <div class="flex shrink-0 items-center justify-between border-b border-gray-100 px-2 py-1.5 dark:border-gray-700/60">
            <span
              class="inline-flex size-6 items-center justify-center rounded-full text-sm font-semibold"
              :class="isTodayDate(date) ? 'bg-violet-500 text-white' : 'text-gray-700 dark:text-gray-200'"
            >
              {{ date.getDate() }}
            </span>
            <span class="text-[11px] text-gray-400 dark:text-gray-500">
              {{ date.toLocaleDateString('es-CO', { month: 'short' }) }}
            </span>
          </div>

          <div class="flex min-h-0 grow flex-col gap-1 overflow-y-auto p-1.5">
            <button
              v-for="(event, eventIndex) in getEventsForDate(events, date)"
              :key="event.id ?? `${date.toISOString()}-${eventIndex}`"
              type="button"
              class="w-full cursor-pointer text-left"
              @click.stop="emit('event-click', event)"
            >
              <div
                class="overflow-hidden rounded-md px-1.5 py-1"
                :class="resolveEventColorClass(event.eventColor)"
              >
                <div class="truncate text-xs font-semibold leading-tight">
                  {{ event.eventName }}
                </div>
                <div class="truncate text-[10px] uppercase leading-tight">
                  <span v-if="event.eventStart">{{ formatEventTime(event.eventStart) }}</span>
                  <span v-if="event.eventEnd">
                    - <span>{{ formatEventTime(event.eventEnd) }}</span>
                  </span>
                </div>
              </div>
            </button>

            <p
              v-if="getEventsForDate(events, date).length === 0"
              class="px-1 py-2 text-xs text-gray-400 dark:text-gray-500"
            >
              Sin eventos
            </p>
          </div>
        </div>
      </div>

      <!-- Day view -->
      <div
        v-else
        class="min-h-0 flex-1 overflow-y-auto p-4"
        :class="fitHeight ? '' : 'min-h-64'"
      >
        <div class="mb-4 flex items-center justify-between gap-3">
          <p class="text-sm font-medium capitalize text-gray-500 dark:text-gray-400">
            {{ dayEvents.length }}
            {{ dayEvents.length === 1 ? 'agendamiento' : 'agendamientos' }}
          </p>
        </div>

        <div
          v-if="dayEvents.length > 0"
          class="space-y-2"
        >
          <button
            v-for="(event, eventIndex) in dayEvents"
            :key="event.id ?? `day-event-${eventIndex}`"
            type="button"
            class="flex w-full cursor-pointer items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 text-left transition hover:bg-gray-100 dark:border-gray-700/60 dark:bg-gray-900/40 dark:hover:bg-gray-900/70"
            @click="emit('event-click', event)"
          >
            <div
              class="mt-0.5 h-10 w-1 shrink-0 rounded-full"
              :class="resolveEventColorClass(event.eventColor).split(' ').find((item) => item.startsWith('bg-'))"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                {{ event.eventName }}
              </p>
              <p class="mt-0.5 text-xs uppercase text-gray-500 dark:text-gray-400">
                <span v-if="event.eventStart">{{ formatEventTime(event.eventStart) }}</span>
                <span v-if="event.eventEnd">
                  - <span>{{ formatEventTime(event.eventEnd) }}</span>
                </span>
              </p>
            </div>
          </button>
        </div>

        <p
          v-else
          class="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700/60 dark:text-gray-400"
        >
          No hay agendamientos para este día.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type {
  CalendarEvent,
  CalendarFilterOption,
  CalendarViewMode,
} from './calendar.types'
import {
  CALENDAR_DAY_NAMES_ES,
  CALENDAR_MONTH_NAMES_ES,
} from './calendar.types'
import {
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

defineOptions({
  name: 'UCalendar',
})

const props = withDefaults(defineProps<{
  events?: CalendarEvent[]
  filters?: CalendarFilterOption[]
  month?: number
  year?: number
  viewMode?: CalendarViewMode
  maxVisibleEvents?: number
  showCreateButton?: boolean
  showAddFilterButton?: boolean
  fitHeight?: boolean
  bodyMaxHeight?: string
  createLabel?: string
  addFilterLabel?: string
  activeFilterKey?: string | null
}>(), {
  events: () => [],
  filters: () => [],
  month: undefined,
  year: undefined,
  viewMode: undefined,
  maxVisibleEvents: 2,
  showCreateButton: true,
  showAddFilterButton: false,
  fitHeight: false,
  bodyMaxHeight: 'calc(100dvh - 17rem)',
  createLabel: 'Crear evento',
  addFilterLabel: '+Agregar',
  activeFilterKey: undefined,
})

const emit = defineEmits<{
  'update:month': [month: number]
  'update:year': [year: number]
  'update:viewMode': [mode: CalendarViewMode]
  'update:activeFilterKey': [key: string | null]
  'create-event': []
  'add-filter': []
  'event-click': [event: CalendarEvent]
  'day-click': [payload: { day: number, month: number, year: number }]
  'more-click': [payload: { day: number, events: CalendarEvent[] }]
  'change-month': [payload: { month: number, year: number }]
}>()

const today = startOfDay(new Date())
const internalMonth = ref(props.month ?? today.getMonth())
const internalYear = ref(props.year ?? today.getFullYear())
const internalFocusDay = ref(today.getDate())
const internalViewMode = ref<CalendarViewMode>(props.viewMode ?? 'month')
const internalActiveFilterKey = ref<string | null>(props.activeFilterKey ?? null)

const month = computed(() => props.month ?? internalMonth.value)
const year = computed(() => props.year ?? internalYear.value)
const viewMode = computed(() => props.viewMode ?? internalViewMode.value)
const activeFilterKey = computed(() => props.activeFilterKey ?? internalActiveFilterKey.value)

const focusDate = computed(() =>
  startOfDay(new Date(year.value, month.value, internalFocusDay.value)),
)

const dayNames = CALENDAR_DAY_NAMES_ES
const viewModes: CalendarViewMode[] = ['month', 'week', 'day']
const viewModeLabels: Record<CalendarViewMode, string> = {
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
}

const weekDates = computed(() => getWeekDates(focusDate.value))
const dayEvents = computed(() => getEventsForDate(props.events, focusDate.value))

const titleLabel = computed(() => {
  if (viewMode.value === 'week') return formatWeekTitle(weekDates.value)
  if (viewMode.value === 'day') return formatDayTitle(focusDate.value)
  return `${CALENDAR_MONTH_NAMES_ES[month.value]} ${year.value}`
})

const previousNavLabel = computed(() => {
  if (viewMode.value === 'week') return 'Semana anterior'
  if (viewMode.value === 'day') return 'Día anterior'
  return 'Mes anterior'
})

const nextNavLabel = computed(() => {
  if (viewMode.value === 'week') return 'Semana siguiente'
  if (viewMode.value === 'day') return 'Día siguiente'
  return 'Mes siguiente'
})

const monthGrid = computed(() => buildCalendarMonthGrid(year.value, month.value))
const daysInMonth = computed(() => monthGrid.value.daysInMonth)
const startingBlankDays = computed(() => monthGrid.value.startingBlankDays)
const endingBlankDays = computed(() => monthGrid.value.endingBlankDays)

const rootStyle = computed(() => {
  if (!props.fitHeight) return undefined
  const maxHeight = props.bodyMaxHeight?.trim()
  if (!maxHeight) return undefined
  return { maxHeight, height: maxHeight }
})

const dayCellClass = computed(() =>
  props.fitHeight
    ? 'min-h-0 h-full'
    : 'h-20 sm:h-28 lg:h-36',
)

const blankDayCellClass = computed(() =>
  props.fitHeight
    ? 'min-h-0 h-full bg-gray-50 dark:bg-gray-800'
    : 'h-20 bg-gray-50 sm:h-28 lg:h-36 dark:bg-gray-800',
)

const syncFocusDate = (date: Date) => {
  const next = startOfDay(date)
  internalYear.value = next.getFullYear()
  internalMonth.value = next.getMonth()
  internalFocusDay.value = next.getDate()
  emit('update:month', internalMonth.value)
  emit('update:year', internalYear.value)
  emit('change-month', { month: internalMonth.value, year: internalYear.value })
}

watch(
  () => props.month,
  (value) => {
    if (value != null) internalMonth.value = value
  },
)

watch(
  () => props.year,
  (value) => {
    if (value != null) internalYear.value = value
  },
)

watch(
  () => props.viewMode,
  (value) => {
    if (value) internalViewMode.value = value
  },
)

watch(
  () => props.activeFilterKey,
  (value) => {
    internalActiveFilterKey.value = value
  },
)

const goToPrevious = () => {
  if (viewMode.value === 'week') {
    syncFocusDate(addDays(focusDate.value, -7))
    return
  }

  if (viewMode.value === 'day') {
    syncFocusDate(addDays(focusDate.value, -1))
    return
  }

  const previous = new Date(year.value, month.value - 1, 1)
  syncFocusDate(previous)
}

const goToNext = () => {
  if (viewMode.value === 'week') {
    syncFocusDate(addDays(focusDate.value, 7))
    return
  }

  if (viewMode.value === 'day') {
    syncFocusDate(addDays(focusDate.value, 1))
    return
  }

  const next = new Date(year.value, month.value + 1, 1)
  syncFocusDate(next)
}

const setViewMode = (mode: CalendarViewMode) => {
  if (mode === 'day') {
    syncFocusDate(today)
  }

  internalViewMode.value = mode
  emit('update:viewMode', mode)
}

const openDayViewFromDate = (date: Date) => {
  const next = startOfDay(date)
  syncFocusDate(next)
  internalViewMode.value = 'day'
  emit('update:viewMode', 'day')
  emit('day-click', {
    day: next.getDate(),
    month: next.getMonth(),
    year: next.getFullYear(),
  })
}

const openDayView = (day: number) => {
  openDayViewFromDate(new Date(year.value, month.value, day))
}

const toggleFilter = (key: string) => {
  const next = activeFilterKey.value === key ? null : key
  internalActiveFilterKey.value = next
  emit('update:activeFilterKey', next)
}

const getMonthDayEvents = (day: number) =>
  getEventsForDay(props.events, year.value, month.value, day)

const getVisibleMonthEvents = (day: number) =>
  getMonthDayEvents(day).slice(0, props.maxVisibleEvents)
</script>
