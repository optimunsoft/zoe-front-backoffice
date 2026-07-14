<template>
  <InputField
    :label="label"
    :html-for="triggerId"
    :required="required"
    :hint="hint"
    :error="error"
  >
    <div ref="anchorRef" class="relative text-sm">
      <button
        :id="triggerId"
        type="button"
        class="form-input flex w-full items-center justify-between gap-2 text-left text-sm"
        :class="[
          disabled ? 'cursor-not-allowed opacity-60' : '',
          !displayLabel ? 'text-gray-400 dark:text-gray-500' : '',
          error ? 'border-red-300 dark:border-red-500/50' : '',
        ]"
        :disabled="disabled"
        :aria-expanded="panelOpen"
        aria-haspopup="dialog"
        @click="togglePanel"
      >
        <span class="truncate text-sm">
          {{ displayLabel || placeholder }}
        </span>
        <UiIcon
          name="scheduling"
          size="sm"
          class="shrink-0 text-gray-400 dark:text-gray-500"
        />
      </button>

      <input
        v-if="name"
        type="hidden"
        :name="name"
        :value="modelValue"
      >

      <Teleport to="body">
        <transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-out duration-75"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="panelOpen && panelStyle"
            ref="panelRef"
            class="fixed rounded-xl border border-gray-200 bg-white p-2 text-sm shadow-xl dark:border-gray-700/60 dark:bg-gray-800"
            :style="panelBoxStyle"
            role="dialog"
            aria-label="Seleccionar hora"
          >
            <div class="flex items-stretch gap-2">
              <input
                ref="hourInputRef"
                type="text"
                inputmode="numeric"
                maxlength="2"
                autocomplete="off"
                class="h-8 min-w-0 flex-1 rounded-lg border px-2 text-center text-sm font-semibold tabular-nums outline-none transition"
                :class="boxClass('hour')"
                :value="draftHour"
                aria-label="Hora"
                @focus="activeField = 'hour'"
                @blur="onHourBlur"
                @keydown="onHourKeydown"
                @input="onHourInput"
              >

              <span
                class="flex h-8 shrink-0 items-center text-sm font-semibold text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              >
                :
              </span>

              <input
                ref="minuteInputRef"
                type="text"
                inputmode="numeric"
                maxlength="2"
                autocomplete="off"
                class="h-8 min-w-0 flex-1 rounded-lg border px-2 text-center text-sm font-semibold tabular-nums outline-none transition"
                :class="boxClass('minute')"
                :value="draftMinute"
                aria-label="Minuto"
                @focus="activeField = 'minute'"
                @blur="onMinuteBlur"
                @keydown="onMinuteKeydown"
                @input="onMinuteInput"
              >

              <select
                class="form-select h-8 w-auto min-w-16 shrink-0 py-0 text-sm font-semibold"
                :value="draftPeriod"
                aria-label="AM o PM"
                @change="onPeriodChange"
              >
                <option value="AM">
                  AM
                </option>
                <option value="PM">
                  PM
                </option>
              </select>

              <button
                type="button"
                class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500 text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Confirmar hora"
                :disabled="!canConfirm"
                @click="confirmAndClose"
              >
                <UiIcon name="plus" size="sm" />
              </button>
            </div>
          </div>
        </transition>
      </Teleport>
    </div>
  </InputField>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'

import { useAnchoredOverlay } from '~/core/company/composables/use-anchored-overlay'
import { UiIcon } from '~/core/ui/icons'
import InputField from './InputField.vue'

type Period = 'AM' | 'PM'
type TimeField = 'hour' | 'minute'

const TIME_VALUE_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/

const props = withDefaults(defineProps<{
  modelValue?: string
  id?: string
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  hint?: string
  error?: string
}>(), {
  modelValue: '',
  placeholder: 'Seleccionar hora',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const generatedId = useId()
const triggerId = computed(() => props.id ?? generatedId)

const panelOpen = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const hourInputRef = ref<HTMLInputElement | null>(null)
const minuteInputRef = ref<HTMLInputElement | null>(null)
const activeField = ref<TimeField>('hour')

const draftHour = ref('')
const draftMinute = ref('')
const draftPeriod = ref<Period>('AM')

const { anchorRef, panelStyle, updatePosition } = useAnchoredOverlay(panelOpen, {
  zIndex: 110,
  maxHeight: 120,
  offset: 6,
})

const panelBoxStyle = computed(() => {
  if (!panelStyle.value) return undefined

  return {
    ...panelStyle.value,
    width: 'min(17rem, calc(100vw - 2rem))',
    minWidth: panelStyle.value.width,
  }
})

const pad = (value: number) => String(value).padStart(2, '0')

const to12Hour = (hour24: number) => {
  const normalized = hour24 % 12
  return normalized === 0 ? 12 : normalized
}

const to24Hour = (hour12: number, nextPeriod: Period) => {
  const clamped = Math.min(12, Math.max(1, hour12))
  if (nextPeriod === 'AM') return clamped === 12 ? 0 : clamped
  return clamped === 12 ? 12 : clamped + 12
}

const parseParts = (value: string) => {
  const match = TIME_VALUE_REGEX.exec(value.trim())
  if (!match) {
    return { hour: '', minute: '', period: 'AM' as Period }
  }

  const hour24 = Number(match[1])
  return {
    hour: pad(to12Hour(hour24)),
    minute: match[2] ?? '00',
    period: (hour24 >= 12 ? 'PM' : 'AM') as Period,
  }
}

const formatDisplay = (value: string) => {
  const parts = parseParts(value)
  if (!parts.hour || !parts.minute) return ''
  return `${Number(parts.hour)}:${parts.minute} ${parts.period}`
}

const displayLabel = computed(() => formatDisplay(props.modelValue))

const syncDraftFromValue = (value: string) => {
  const parts = parseParts(value)
  draftHour.value = parts.hour
  draftMinute.value = parts.minute
  draftPeriod.value = parts.period
  activeField.value = 'hour'
}

const buildDraftValue = () => {
  const hour12 = Number(draftHour.value)
  const minute = Number(draftMinute.value)

  if (!draftHour.value || !draftMinute.value || Number.isNaN(hour12) || Number.isNaN(minute)) {
    return ''
  }
  if (hour12 < 1 || hour12 > 12 || minute < 0 || minute > 59) return ''

  return `${pad(to24Hour(hour12, draftPeriod.value))}:${pad(minute)}`
}

const canConfirm = computed(() => Boolean(buildDraftValue()))

const commitDraft = () => {
  const nextValue = buildDraftValue()
  if (!nextValue || nextValue === props.modelValue) return
  emit('update:modelValue', nextValue)
}

const confirmAndClose = () => {
  commitHourDraft()
  commitMinuteDraft()
  const nextValue = buildDraftValue()
  if (!nextValue) return
  emit('update:modelValue', nextValue)
  panelOpen.value = false
  activeField.value = 'hour'
}

const boxClass = (field: TimeField) => {
  if (activeField.value === field) {
    return 'border-violet-500 bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/20 dark:border-violet-400 dark:bg-violet-500/15 dark:text-violet-200'
  }

  return 'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-100'
}

const digitsOnly = (value: string) => value.replace(/\D/g, '').slice(0, 2)

const commitHourDraft = () => {
  const digits = digitsOnly(draftHour.value)
  if (!digits) {
    draftHour.value = ''
    return
  }

  let hour12 = Number(digits)
  if (hour12 === 0) hour12 = 12
  if (hour12 > 12) hour12 = Number(digits.slice(-1)) || 12
  draftHour.value = pad(hour12)
  commitDraft()
}

const commitMinuteDraft = () => {
  const digits = digitsOnly(draftMinute.value)
  if (!digits) {
    draftMinute.value = ''
    return
  }

  let minute = Number(digits)
  if (minute > 59) minute = Number(digits.slice(-1))
  draftMinute.value = pad(minute)
  commitDraft()
}

const onHourInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const digits = digitsOnly(input.value)
  draftHour.value = digits
  input.value = digits

  if (digits.length === 2) {
    commitHourDraft()
    void nextTick(() => {
      minuteInputRef.value?.focus()
      minuteInputRef.value?.select()
    })
  }
}

const onMinuteInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const digits = digitsOnly(input.value)
  draftMinute.value = digits
  input.value = digits

  if (digits.length === 2) commitMinuteDraft()
}

const onHourBlur = () => {
  commitHourDraft()
  if (activeField.value === 'hour') activeField.value = 'minute'
}

const onMinuteBlur = () => {
  commitMinuteDraft()
}

const onHourKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowRight' || event.key === ':') {
    event.preventDefault()
    minuteInputRef.value?.focus()
    minuteInputRef.value?.select()
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    confirmAndClose()
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    closePanel()
  }
}

const onMinuteKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    hourInputRef.value?.focus()
    hourInputRef.value?.select()
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    confirmAndClose()
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    closePanel()
  }
}

const onPeriodChange = (event: Event) => {
  const nextPeriod = (event.target as HTMLSelectElement).value as Period
  draftPeriod.value = nextPeriod === 'PM' ? 'PM' : 'AM'
  if (!draftHour.value) draftHour.value = '12'
  if (!draftMinute.value) draftMinute.value = '00'
  commitDraft()
}

const openPanel = async () => {
  if (props.disabled) return

  // Sin valor previo siempre arranca en AM (09:00).
  const initialValue = props.modelValue?.trim() || '09:00'
  syncDraftFromValue(initialValue)
  if (!props.modelValue?.trim()) {
    draftPeriod.value = 'AM'
  }

  panelOpen.value = true
  await nextTick()
  updatePosition()
  hourInputRef.value?.focus()
  hourInputRef.value?.select()
}

const closePanel = () => {
  commitHourDraft()
  commitMinuteDraft()
  commitDraft()
  panelOpen.value = false
  activeField.value = 'hour'
}

const togglePanel = async () => {
  if (panelOpen.value) {
    closePanel()
    return
  }
  await openPanel()
}

const clickHandler = ({ target }: MouseEvent) => {
  if (!panelOpen.value || !target || !(target instanceof Node)) return
  if (anchorRef.value?.contains(target)) return
  if (panelRef.value?.contains(target)) return
  closePanel()
}

const keyHandler = ({ key }: KeyboardEvent) => {
  if (!panelOpen.value || key !== 'Escape') return
  closePanel()
}

watch(
  () => props.modelValue,
  (value) => {
    if (!panelOpen.value) return
    if (import.meta.client) {
      const active = document.activeElement
      if (active === hourInputRef.value || active === minuteInputRef.value) return
    }
    syncDraftFromValue(value)
  },
)

onMounted(() => {
  document.addEventListener('click', clickHandler)
  document.addEventListener('keydown', keyHandler)
})

onUnmounted(() => {
  document.removeEventListener('click', clickHandler)
  document.removeEventListener('keydown', keyHandler)
})
</script>
