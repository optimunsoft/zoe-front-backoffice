<template>
  <InputField :label="label" :html-for="inputId">
    <form @submit.prevent="emit('submit', modelValue)">
      <div class="relative">
        <input
          :id="inputId"
          :value="modelValue"
          type="search"
          :name="name"
          :placeholder="placeholder"
          class="form-input w-full pl-9"
          :class="inputClass"
          @input="onInput"
        >
        <button
          class="absolute inset-0 right-auto group"
          type="submit"
          :aria-label="searchLabel"
        >
          <svg
            class="shrink-0 fill-current text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 ml-3 mr-2"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
            <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
          </svg>
        </button>
      </div>
    </form>
  </InputField>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

import InputField from './InputField.vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  id?: string
  name?: string
  label?: string
  placeholder?: string
  searchLabel?: string
  inputClass?: string
}>(), {
  modelValue: '',
  searchLabel: 'Search',
  inputClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [value: string]
}>()

const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>
