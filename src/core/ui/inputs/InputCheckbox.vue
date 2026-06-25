<template>
  <label class="flex items-center" :class="labelClass">
    <input
      :id="inputId"
      type="checkbox"
      class="form-checkbox"
      :class="disabledClass"
      :checked="modelValue"
      :name="name"
      :value="value"
      :disabled="disabled"
      @change="onChange"
    >
    <span v-if="label || $slots.default" class="text-sm ml-2">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  id?: string
  name?: string
  value?: string | number
  label?: string
  disabled?: boolean
  labelClass?: string
}>(), {
  modelValue: false,
  labelClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)

const disabledClass = computed(() => {
  if (!props.disabled) return ''
  return 'disabled:border-gray-200 dark:disabled:border-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800'
})

const onChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>
