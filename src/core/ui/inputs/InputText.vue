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
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        class="form-input w-full"
        :class="[
          sizeClass,
          stateClass,
          disabledClass,
          paddingClass,
          inputClass,
        ]"
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
    </div>
  </InputField>
</template>

<script setup lang="ts">
import { computed, useId, useSlots } from 'vue'

import InputField from './InputField.vue'
import type { InputSize, InputState } from './input.types'

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
}>(), {
  modelValue: '',
  type: 'text',
  size: 'md',
  state: 'default',
  inputClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const slots = useSlots()
const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'px-2 py-1'
  if (props.size === 'lg') return 'px-4 py-3'
  return ''
})

const stateClass = computed(() => {
  if (props.state === 'error') return 'border-red-300'
  if (props.state === 'success') return 'border-green-300'
  return ''
})

const disabledClass = computed(() => {
  if (!props.disabled) return ''
  return 'dark:disabled:placeholder:text-gray-600 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed shadow-none'
})

const paddingClass = computed(() => {
  const classes: string[] = []
  if (props.prefix || slots.prefix) classes.push('pl-12')
  if (props.suffix || slots.suffix) classes.push('pr-8')
  if (slots.leading) classes.push('pl-9')
  return classes.join(' ')
})

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>
