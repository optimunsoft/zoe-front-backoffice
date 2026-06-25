<template>
  <div class="flex items-center" :class="wrapperClass">
    <div class="form-switch">
      <input
        :id="inputId"
        type="checkbox"
        class="sr-only"
        :checked="isOn"
        :disabled="disabled"
        @change="onChange"
      >
      <label :for="inputId">
        <span class="bg-white shadow-xs" aria-hidden="true" />
        <span class="sr-only">{{ label || 'Toggle' }}</span>
      </label>
    </div>
    <div
      v-if="showStateLabel"
      class="text-sm text-gray-400 dark:text-gray-500 italic ml-2"
    >
      {{ stateLabel }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  id?: string
  label?: string
  disabled?: boolean
  showStateLabel?: boolean
  onLabel?: string
  offLabel?: string
  wrapperClass?: string
}>(), {
  modelValue: false,
  showStateLabel: true,
  onLabel: 'On',
  offLabel: 'Off',
  wrapperClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const isOn = computed(() => props.modelValue)

const stateLabel = computed(() => {
  if (props.disabled) return 'Disabled'
  return props.modelValue ? props.onLabel : props.offLabel
})

const onChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>
