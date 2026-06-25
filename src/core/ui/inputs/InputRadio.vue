<template>
  <label class="flex items-center" :class="labelClass">
    <input
      :id="inputId"
      type="radio"
      class="form-radio"
      :class="disabledClass"
      :checked="isChecked"
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
  modelValue?: string | number | boolean
  id?: string
  name?: string
  value: string | number | boolean
  label?: string
  disabled?: boolean
  labelClass?: string
}>(), {
  labelClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
}>()

const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)

const isChecked = computed(() => props.modelValue === props.value)

const disabledClass = computed(() => {
  if (!props.disabled) return ''
  return 'disabled:border-gray-200 dark:disabled:border-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800'
})

const onChange = () => {
  emit('update:modelValue', props.value)
}
</script>
