<template>
  <InputField
    :label="label"
    :html-for="selectId"
    :required="required"
    :hint="hint"
    :error="error"
  >
    <select
      :id="selectId"
      :value="modelValue"
      :name="name"
      :required="required"
      :disabled="disabled"
      class="form-select w-full"
      :class="selectClass"
      @change="onChange"
    >
      <option v-if="placeholder" disabled value="">
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="String(option.value)"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
      <slot />
    </select>
  </InputField>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

import InputField from './InputField.vue'
import type { InputSelectOption } from './input.types'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  id?: string
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  hint?: string
  error?: string
  options?: InputSelectOption[]
  selectClass?: string
}>(), {
  modelValue: '',
  options: () => [],
  selectClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const generatedId = useId()
const selectId = computed(() => props.id ?? generatedId)

const onChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>
