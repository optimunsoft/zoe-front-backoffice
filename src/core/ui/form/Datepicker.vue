<template>
  <InputField
    :label="label"
    :html-for="pickerId"
    :required="required"
  >
    <div class="relative">
      <flat-pickr
        :id="pickerId"
        :model-value="displayValue"
        class="form-input pl-9 dark:bg-gray-800 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 font-medium"
        :class="fullWidth ? 'w-full' : 'w-[15.5rem]'"
        :config="config"
        @update:model-value="handleFlatpickrUpdate"
      />
      <div class="absolute inset-0 right-auto flex items-center pointer-events-none">
        <svg class="fill-current text-gray-400 dark:text-gray-500 ml-3" width="16" height="16" viewBox="0 0 16 16">
          <path d="M5 4a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z" />
          <path d="M4 0a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4H4ZM2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z" />
        </svg>
      </div>
    </div>
  </InputField>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import flatPickr from 'vue-flatpickr-component'
import type flatpickr from 'flatpickr'

import InputField from '~/core/ui/inputs/InputField.vue'

const MONTH_LABELS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] as const
const MONTH_LABELS_FULL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const

type QuickPickerView = 'days' | 'months' | 'years'

type QuickNavState = {
  view: QuickPickerView
  yearGridAnchor: number
  refreshHeader: () => void
  closePanels: () => void
}

const quickNavState = new WeakMap<flatpickr.Instance, QuickNavState>()

const props = withDefaults(defineProps<{
  modelValue?: string | Date | Date[] | null
  id?: string
  label?: string
  required?: boolean
  align?: string
  mode?: 'single' | 'range'
  dateFormat?: string
  fullWidth?: boolean
  yearMonthDropdowns?: boolean
  minYear?: number
  maxYear?: number
  maxDate?: Date | string
}>(), {
  modelValue: null,
  required: false,
  mode: 'range',
  dateFormat: '',
  fullWidth: false,
  yearMonthDropdowns: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | Date | Date[] | null]
}>()

const generatedId = useId()
const pickerId = computed(() => props.id ?? generatedId)

const isRange = computed(() => props.mode === 'range')
const resolvedFormat = computed(() => props.dateFormat || (isRange.value ? 'M j, Y' : 'd/m/Y'))

const formatSingleDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  if (resolvedFormat.value === 'd/m/Y') {
    return `${day}/${month}/${year}`
  }

  return date.toLocaleDateString('es-CO')
}

const parseSingleDate = (value: string): Date | null => {
  const trimmed = value.trim()
  if (!trimmed) return null

  if (resolvedFormat.value === 'd/m/Y') {
    const parts = trimmed.split('/').map(Number)
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null
    const [day, month, year] = parts
    if (day == null || month == null || year == null) return null
    const date = new Date(year, month - 1, day)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const date = new Date(trimmed)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Flatpickr compara modelValue con el string del input.
 * Si le pasamos un Date, hace setDate(..., true) en bucle y congela la UI.
 * Por eso el valor hacia flatpickr siempre debe ser string (o null).
 */
const displayValue = computed<string | Date[] | null>(() => {
  const value = props.modelValue

  if (value == null || value === '') return null
  if (Array.isArray(value)) return value
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return formatSingleDate(value)
  }

  return String(value)
})

const sameSingleValue = (left: string | Date | null | undefined, right: Date | null) => {
  if (left == null || left === '') return right == null
  if (right == null) return false

  if (left instanceof Date) {
    return left.getTime() === right.getTime()
  }

  const parsed = parseSingleDate(String(left))
  return parsed != null && parsed.getTime() === right.getTime()
}

const handleFlatpickrUpdate = (value: string | Date | Date[] | null) => {
  if (isRange.value) {
    emit('update:modelValue', value)
    return
  }

  if (value == null || value === '') {
    if (props.modelValue != null && props.modelValue !== '') {
      emit('update:modelValue', null)
    }
    return
  }

  if (value instanceof Date) {
    if (!sameSingleValue(props.modelValue as string | Date | null, value)) {
      emit('update:modelValue', value)
    }
    return
  }

  if (typeof value === 'string') {
    const parsed = parseSingleDate(value)
    if (parsed) {
      if (!sameSingleValue(props.modelValue as string | Date | null, parsed)) {
        emit('update:modelValue', parsed)
      }
      return
    }

    if (props.modelValue !== value) {
      emit('update:modelValue', value)
    }
  }
}

const currentCalendarYear = () => new Date().getFullYear()

const resolvedMinYear = computed(() => props.minYear ?? currentCalendarYear() - 100)
const resolvedMaxYear = computed(() => props.maxYear ?? currentCalendarYear())

const clampYearGridAnchor = (anchor: number) =>
  Math.max(resolvedMinYear.value, Math.min(anchor, resolvedMaxYear.value - 11))

const setupQuickDateNavigation = (instance: flatpickr.Instance) => {
  const calendar = instance.calendarContainer
  const currentMonth = calendar.querySelector('.flatpickr-current-month')
  const innerContainer = calendar.querySelector('.flatpickr-innerContainer')

  if (!(currentMonth instanceof HTMLElement)
    || !(innerContainer instanceof HTMLElement)) {
    return
  }

  const daysWrapper = innerContainer.querySelector('.flatpickr-rContainer')
  if (!(daysWrapper instanceof HTMLElement)) {
    return
  }

  let panel = innerContainer.querySelector('.flatpickr-quick-panel')
  if (!(panel instanceof HTMLElement)) {
    panel = document.createElement('div')
    panel.className = 'flatpickr-quick-panel'
    innerContainer.appendChild(panel)
  }

  calendar.classList.add('flatpickr-birthdate')

  currentMonth.querySelector('.numInputWrapper')?.remove()
  currentMonth.querySelector('.flatpickr-monthDropdown-months')?.remove()
  currentMonth.querySelector('.cur-month')?.remove()

  const monthButton = document.createElement('button')
  monthButton.type = 'button'
  monthButton.className = 'flatpickr-quick-toggle'

  const yearButton = document.createElement('button')
  yearButton.type = 'button'
  yearButton.className = 'flatpickr-quick-toggle'

  const headerControls = document.createElement('div')
  headerControls.className = 'flatpickr-quick-header'
  headerControls.append(monthButton, yearButton)
  currentMonth.prepend(headerControls)

  const state: QuickNavState = {
    view: 'days',
    yearGridAnchor: clampYearGridAnchor(instance.currentYear - 5),
    refreshHeader: () => {},
    closePanels: () => {},
  }

  const updateHeader = () => {
    monthButton.textContent = MONTH_LABELS_FULL[instance.currentMonth] ?? MONTH_LABELS_SHORT[instance.currentMonth]
    yearButton.textContent = String(instance.currentYear)
    monthButton.classList.toggle('is-active', state.view === 'months')
    yearButton.classList.toggle('is-active', state.view === 'years')
  }

  const setView = (nextView: QuickPickerView) => {
    state.view = nextView
    calendar.classList.remove('flatpickr-quick-view-months', 'flatpickr-quick-view-years', 'flatpickr-quick-view-picker')

    if (nextView === 'months') {
      calendar.classList.add('flatpickr-quick-view-picker', 'flatpickr-quick-view-months')
      renderMonthGrid()
    } else if (nextView === 'years') {
      calendar.classList.add('flatpickr-quick-view-picker', 'flatpickr-quick-view-years')
      renderYearGrid()
    }

    updateHeader()
  }

  const renderMonthGrid = () => {
    panel.replaceChildren()
    const grid = document.createElement('div')
    grid.className = 'flatpickr-quick-grid'

    MONTH_LABELS_SHORT.forEach((label, monthIndex) => {
      const cell = document.createElement('button')
      cell.type = 'button'
      cell.className = 'flatpickr-quick-cell'
      cell.textContent = label
      cell.setAttribute('aria-label', MONTH_LABELS_FULL[monthIndex])

      if (monthIndex === instance.currentMonth) {
        cell.classList.add('is-selected')
      }

      cell.addEventListener('click', () => {
        instance.changeMonth(monthIndex, false)
        setView('days')
      })

      grid.appendChild(cell)
    })

    panel.appendChild(grid)
  }

  const renderYearGrid = () => {
    state.yearGridAnchor = clampYearGridAnchor(state.yearGridAnchor)
    panel.replaceChildren()

    const nav = document.createElement('div')
    nav.className = 'flatpickr-quick-nav'

    const prevButton = document.createElement('button')
    prevButton.type = 'button'
    prevButton.className = 'flatpickr-quick-nav-btn'
    prevButton.setAttribute('aria-label', 'Años anteriores')
    prevButton.textContent = '‹'
    prevButton.disabled = state.yearGridAnchor <= resolvedMinYear.value

    const rangeLabel = document.createElement('span')
    rangeLabel.className = 'flatpickr-quick-nav-label'

    const nextButton = document.createElement('button')
    nextButton.type = 'button'
    nextButton.className = 'flatpickr-quick-nav-btn'
    nextButton.setAttribute('aria-label', 'Años siguientes')
    nextButton.textContent = '›'
    nextButton.disabled = state.yearGridAnchor + 12 > resolvedMaxYear.value

    const grid = document.createElement('div')
    grid.className = 'flatpickr-quick-grid flatpickr-quick-grid-years'

    const rangeEnd = Math.min(state.yearGridAnchor + 11, resolvedMaxYear.value)
    rangeLabel.textContent = `${state.yearGridAnchor} – ${rangeEnd}`

    for (let year = state.yearGridAnchor; year <= rangeEnd; year += 1) {
      const cell = document.createElement('button')
      cell.type = 'button'
      cell.className = 'flatpickr-quick-cell'
      cell.textContent = String(year)

      if (year === instance.currentYear) {
        cell.classList.add('is-selected')
      }

      cell.addEventListener('click', () => {
        instance.changeYear(year)
        setView('days')
      })

      grid.appendChild(cell)
    }

    prevButton.addEventListener('click', () => {
      state.yearGridAnchor = clampYearGridAnchor(state.yearGridAnchor - 12)
      renderYearGrid()
    })

    nextButton.addEventListener('click', () => {
      state.yearGridAnchor = clampYearGridAnchor(state.yearGridAnchor + 12)
      renderYearGrid()
    })

    nav.append(prevButton, rangeLabel, nextButton)
    panel.append(nav, grid)
  }

  state.refreshHeader = () => {
    updateHeader()
    if (state.view !== 'days') {
      setView('days')
    }
  }

  state.closePanels = () => setView('days')

  monthButton.addEventListener('click', () => {
    setView(state.view === 'months' ? 'days' : 'months')
  })

  yearButton.addEventListener('click', () => {
    if (state.view !== 'years') {
      state.yearGridAnchor = clampYearGridAnchor(instance.currentYear - 5)
    }
    setView(state.view === 'years' ? 'days' : 'years')
  })

  quickNavState.set(instance, state)
  updateHeader()
}

const syncQuickDateNavigation = (instance: flatpickr.Instance) => {
  quickNavState.get(instance)?.refreshHeader()
}

const stopCalendarEventPropagation = (event: Event) => {
  event.stopPropagation()
}

const config = computed(() => {
  const rangeMode = isRange.value

  return {
    mode: props.mode,
    appendTo: import.meta.client ? document.body : undefined,
    monthSelectorType: 'static' as const,
    dateFormat: resolvedFormat.value,
    ...(props.yearMonthDropdowns
      ? { maxDate: props.maxDate ?? new Date() }
      : {}),
    ...(rangeMode
      ? { defaultDate: [new Date().setDate(new Date().getDate() - 6), new Date()] }
      : {}),
    prevArrow: '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
    nextArrow: '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
    onReady: (_selectedDates: Date[], dateStr: string, instance: flatpickr.Instance) => {
      if (rangeMode) {
        (instance.element as HTMLInputElement).value = dateStr.replace('to', '-')
      }
      const customClass = props.align ?? ''
      instance.calendarContainer.classList.add(`flatpickr-${customClass}`)
      instance.calendarContainer.classList.add('flatpickr-overlay')

      // Evita que clics del calendario lleguen al backdrop del modal.
      instance.calendarContainer.addEventListener('mousedown', stopCalendarEventPropagation)
      instance.calendarContainer.addEventListener('click', stopCalendarEventPropagation)
      instance.calendarContainer.addEventListener('pointerdown', stopCalendarEventPropagation)

      if (props.yearMonthDropdowns) {
        setupQuickDateNavigation(instance)
      }
    },
    onOpen: (_selectedDates: Date[], _dateStr: string, instance: flatpickr.Instance) => {
      if (props.yearMonthDropdowns) {
        quickNavState.get(instance)?.closePanels()
      }
    },
    onMonthChange: (_selectedDates: Date[], _dateStr: string, instance: flatpickr.Instance) => {
      if (props.yearMonthDropdowns) {
        syncQuickDateNavigation(instance)
      }
    },
    onYearChange: (_selectedDates: Date[], _dateStr: string, instance: flatpickr.Instance) => {
      if (props.yearMonthDropdowns) {
        syncQuickDateNavigation(instance)
      }
    },
    onChange: (selectedDates: Date[], dateStr: string, instance: flatpickr.Instance) => {
      if (!rangeMode) return

      const input = instance.element as HTMLInputElement
      input.value = dateStr.replace('to', '-')
      emit('update:modelValue', input.value)
    },
  }
})
</script>
