<template>
  <InputField
    :label="label"
    :html-for="inputId"
    :required="required"
    :hint="hint"
    :error="error"
    :hint-class="state === 'success' ? 'text-green-500' : ''"
  >
    <template v-if="$slots.tooltip" #tooltip>
      <slot name="tooltip" />
    </template>

    <div class="relative">
      <input
        :id="inputId"
        :value="modelValue"
        :type="resolvedType"
        :name="name"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :inputmode="digitsOnly ? 'numeric' : undefined"
        :maxlength="maxLength || undefined"
        :autocomplete="resolvedAutocomplete"
        data-lpignore="true"
        data-1p-ignore="true"
        data-bwignore="true"
        data-form-type="other"
        class="form-input w-full"
        :class="[
          sizeClass,
          stateClass,
          disabledClass,
          paddingClass,
          digitsOnlyClass,
          inputClass,
        ]"
        @keydown="onKeydown"
        @paste="onPaste"
        @input="onInput"
      >

      <div
        v-if="prefix || $slots.prefix"
        class="absolute inset-0 right-auto flex items-center pointer-events-none"
      >
        <slot name="prefix">
          <span class="text-sm text-gray-400 dark:text-gray-500 font-medium px-3">{{ prefix }}</span>
        </slot>
      </div>

      <div
        v-if="suffix || $slots.suffix"
        class="absolute inset-0 left-auto flex items-center pointer-events-none"
      >
        <slot name="suffix">
          <span class="text-sm text-gray-400 dark:text-gray-500 font-medium px-3">{{ suffix }}</span>
        </slot>
      </div>

      <div
        v-if="$slots.leading"
        class="absolute inset-0 right-auto flex items-center pointer-events-none"
      >
        <slot name="leading" />
      </div>

      <button
        v-if="isPasswordField"
        type="button"
        class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 transition hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        :disabled="disabled"
        :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        :aria-pressed="showPassword"
        @click="togglePasswordVisibility"
      >
        <UiIcon :name="showPassword ? 'eyeOff' : 'eye'" size="sm" />
      </button>
    </div>
  </InputField>
</template>

<script setup lang="ts">
import { computed, ref, useId, useSlots } from 'vue'

import {
  blockNonDigitKeydown,
  extractDigitsFromClipboard,
  sanitizeDigitsInput,
} from '~/shared/utils/digits-input.utils'
import { UiIcon } from '~/core/ui/icons'
import InputField from './InputField.vue'
import type { InputSize, InputState } from './input.types'
import {
  getInputDisabledClass,
  getInputSizeClass,
  getInputStateClass,
} from './input.utils'


const props = withDefaults(defineProps<{
  modelValue?: string | number
  id?: string
  name?: string
  type?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  prefix?: string
  suffix?: string
  hint?: string
  error?: string
  size?: InputSize
  state?: InputState
  inputClass?: string
  /** Solo permite dígitos al escribir, pegar o autocompletar. */
  digitsOnly?: boolean
  maxLength?: number
  /** Por defecto desactiva autocompletado de Chrome/Google. */
  autocomplete?: string
}>(), {
  modelValue: '',
  type: 'text',
  size: 'md',
  state: 'default',
  inputClass: '',
  digitsOnly: false,
  autocomplete: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const slots = useSlots()
const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const showPassword = ref(false)

const isPasswordField = computed(() => props.type === 'password' && !props.digitsOnly)

const resolvedAutocomplete = computed(() => {
  if (props.autocomplete) return props.autocomplete
  if (isPasswordField.value) return 'new-password'
  return 'off'
})

const resolvedType = computed(() => {
  if (props.digitsOnly) return 'text'
  if (isPasswordField.value) return showPassword.value ? 'text' : 'password'
  return props.type
})

const digitsOnlyClass = computed(() => (
  props.digitsOnly
    ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
    : ''
))

const sizeClass = computed(() => getInputSizeClass(props.size))

const stateClass = computed(() => getInputStateClass(props.state))

const disabledClass = computed(() => getInputDisabledClass(props.disabled))

const paddingClass = computed(() => {
  const classes: string[] = []
  if (props.prefix || slots.prefix) classes.push('pl-12')
  if (props.suffix || slots.suffix || isPasswordField.value) classes.push('pr-10')
  if (slots.leading) classes.push('pl-9')
  return classes.join(' ')
})

const togglePasswordVisibility = () => {
  if (props.disabled) return
  showPassword.value = !showPassword.value
}

const sanitizeValue = (value: string) => (
  props.digitsOnly
    ? sanitizeDigitsInput(value, props.maxLength)
    : value
)

const onKeydown = (event: KeyboardEvent) => {
  if (!props.digitsOnly || props.disabled) return
  blockNonDigitKeydown(event)
}

const onPaste = (event: ClipboardEvent) => {
  if (!props.digitsOnly || props.disabled) return

  event.preventDefault()

  const input = event.target as HTMLInputElement
  const pastedDigits = extractDigitsFromClipboard(event, props.maxLength)
  if (!pastedDigits) return

  const selectionStart = input.selectionStart ?? input.value.length
  const selectionEnd = input.selectionEnd ?? input.value.length
  const nextValue = sanitizeValue(
    `${input.value.slice(0, selectionStart)}${pastedDigits}${input.value.slice(selectionEnd)}`,
  )

  input.value = nextValue
  emit('update:modelValue', nextValue)
}

const onInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = sanitizeValue(input.value)

  if (input.value !== value) {
    input.value = value
  }

  emit('update:modelValue', value)
}
</script>
