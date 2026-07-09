<template>
  <InputField
    :label="label"
    :html-for="inputId"
    :required="required"
    :hint="hint"
    :error="displayError"
  >
    <input
      :id="inputId"
      ref="fileInputRef"
      type="file"
      class="sr-only"
      :accept="accept"
      :disabled="disabled"
      @change="onFileChange"
    >

    <div
      v-if="variant === 'compact'"
      class="flex items-center gap-3 rounded-lg border border-dashed px-3 py-2 transition"
      :class="dropzoneClass"
    >
      <div
        class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white dark:border-gray-700/60 dark:bg-gray-800"
      >
        <img
          v-if="displayPreviewUrl"
          :src="displayPreviewUrl"
          alt="Vista previa"
          class="size-full object-contain"
        >
        <svg
          v-else
          class="size-5 fill-current text-gray-400 dark:text-gray-500"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
        </svg>
      </div>

      <div class="min-w-0 flex-1">
        <p class="truncate text-xs text-gray-500 dark:text-gray-400">
          {{ helpText }}
        </p>
        <p
          v-if="modelValue"
          class="mt-0.5 truncate text-xs font-medium text-gray-700 dark:text-gray-200"
        >
          {{ modelValue.name }}
        </p>
        <div class="mt-1.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            :disabled="disabled || loading"
            @click="openFilePicker"
          >
            {{ loading ? 'Subiendo...' : 'Subir' }}
          </Button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-5 transition"
      :class="dropzoneClass"
    >
      <img
        v-if="displayPreviewUrl"
        :src="displayPreviewUrl"
        alt="Vista previa"
        class="max-h-24 max-w-full rounded-md object-contain"
      >

      <template v-else>
        <svg
          class="size-8 fill-current text-gray-400 dark:text-gray-500"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
        </svg>

        <p class="text-center text-xs text-gray-500 dark:text-gray-400">
          {{ helpText }}
        </p>
      </template>

      <p
        v-if="modelValue"
        class="max-w-full truncate text-center text-xs font-medium text-gray-700 dark:text-gray-200"
      >
        {{ modelValue.name }}
      </p>

      <div class="flex flex-wrap items-center justify-center">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          :disabled="disabled || loading"
          @click="openFilePicker"
        >
          {{ loading ? 'Subiendo...' : 'Subir' }}
        </Button>
      </div>
    </div>
  </InputField>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'

import { Button } from '~/core/ui/buttons'
import InputField from './InputField.vue'

const props = withDefaults(defineProps<{
  modelValue?: File | null
  remotePreviewUrl?: string | null
  id?: string
  label?: string
  accept?: string
  maxSizeMb?: number
  helpText?: string
  required?: boolean
  disabled?: boolean
  loading?: boolean
  hint?: string
  error?: string
  variant?: 'default' | 'compact'
}>(), {
  modelValue: null,
  remotePreviewUrl: null,
  accept: '.png,.jpg,.jpeg,.mpg,.mp4,image/png,image/jpeg,video/mpeg,video/mp4',
  maxSizeMb: 120,
  helpText: 'Max 120 MB, PNG, JPEG, MPG, MP4',
  required: false,
  disabled: false,
  loading: false,
  variant: 'default',
})

const emit = defineEmits<{
  'update:modelValue': [value: File | null]
  clear: []
}>()

const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const fileInputRef = ref<HTMLInputElement | null>(null)
const localError = ref('')
const previewUrl = ref('')

const displayError = computed(() => props.error || localError.value)

const displayPreviewUrl = computed(() => previewUrl.value || props.remotePreviewUrl || '')

const dropzoneClass = computed(() => {
  if (displayError.value) {
    return 'border-red-300 bg-red-50/40 dark:border-red-500/40 dark:bg-red-500/5'
  }

  return 'border-gray-200 bg-gray-50/50 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-900/20 dark:hover:border-gray-600'
})

const allowedExtensions = computed(() =>
  props.accept
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.startsWith('.')),
)

const maxSizeBytes = computed(() => props.maxSizeMb * 1024 * 1024)

const revokePreview = () => {
  if (!previewUrl.value) return
  URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
}

const updatePreview = (file: File | null) => {
  revokePreview()
  if (!file || !file.type.startsWith('image/')) return
  previewUrl.value = URL.createObjectURL(file)
}

const isAllowedFile = (file: File) => {
  const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`
  const matchesExtension = allowedExtensions.value.length === 0
    || allowedExtensions.value.includes(extension)
  const matchesMime = props.accept
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.includes('/'))
    .includes(file.type)

  return matchesExtension || matchesMime
}

const validateFile = (file: File) => {
  if (!isAllowedFile(file)) {
    return 'Formato no permitido. Usa PNG, JPEG, MPG o MP4.'
  }

  if (file.size > maxSizeBytes.value) {
    return `El archivo supera el máximo de ${props.maxSizeMb} MB.`
  }

  return ''
}

const setFile = (file: File | null) => {
  if (!file) {
    localError.value = ''
    updatePreview(null)
    emit('update:modelValue', null)
    return
  }

  const validationError = validateFile(file)
  if (validationError) {
    localError.value = validationError
    emit('update:modelValue', null)
    updatePreview(null)
    return
  }

  localError.value = ''
  updatePreview(file)
  emit('update:modelValue', file)
}

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  setFile(file)
}

const openFilePicker = () => {
  if (props.disabled) return
  fileInputRef.value?.click()
}

const clearFile = () => {
  if (fileInputRef.value) fileInputRef.value.value = ''
  setFile(null)
  emit('clear')
}

watch(
  () => props.modelValue,
  (file) => {
    if (!file) {
      if (!props.remotePreviewUrl) {
        updatePreview(null)
      }
      return
    }

    if (fileInputRef.value) {
      updatePreview(file)
    }
  },
  { immediate: true },
)

watch(
  () => props.remotePreviewUrl,
  (remoteUrl) => {
    if (!props.modelValue && !remoteUrl) {
      updatePreview(null)
    }
  },
)

onBeforeUnmount(() => {
  revokePreview()
})

defineExpose({
  clear: clearFile,
})
</script>
