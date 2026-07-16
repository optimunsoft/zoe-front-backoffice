<template>
  <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <InputField
        label="Código"
        html-for="module-code"
        required
        hint="Código alfanumérico. Puede incluir guiones (-)."
        :error="errors.code"
      >
        <input
          id="module-code"
          :value="form.code"
          name="code"
          type="text"
          autocomplete="off"
          placeholder="ej. MOD-A01"
          class="form-input w-full"
          :class="errors.code ? 'border-red-300 dark:border-red-500/50' : ''"
          @paste="onCodePaste"
          @input="onCodeInput"
          @blur="validateField('code')"
        >
      </InputField>

      <InputText
        id="module-name"
        v-model="form.name"
        name="name"
        type="text"
        label="Nombre"
        placeholder="Nombre del módulo"
        required
        :error="errors.name"
        :state="errors.name ? 'error' : 'default'"
        @update:model-value="errors.name = ''"
        @blur="validateField('name')"
      />
    </div>

    <InputField
      label="Descripción"
      html-for="module-description"
      hint="Opcional. Breve resumen del módulo."
      :error="errors.description"
    >
      <textarea
        id="module-description"
        v-model="form.description"
        name="description"
        rows="3"
        placeholder="Describe el módulo..."
        class="form-textarea w-full"
        :class="errors.description ? 'border-red-300 dark:border-red-500/50' : ''"
        @input="errors.description = ''"
        @blur="validateField('description')"
      />
    </InputField>

    <InputField
      label="Precio"
      html-for="module-price"
      hint="Opcional. Solo números. Se formatea automáticamente en pesos (COP)."
      :error="errors.price"
    >
      <div class="relative">
        <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-gray-400 dark:text-gray-500">
          $
        </span>
        <input
          id="module-price"
          :value="form.price"
          name="price"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder="0"
          class="form-input w-full pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          :class="errors.price ? 'border-red-300 dark:border-red-500/50' : ''"
          @keydown="blockNonDigitKeydown"
          @paste="onPricePaste"
          @input="onPriceInput"
          @blur="validateField('price')"
        >
      </div>
    </InputField>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

import InputField from '~/core/ui/inputs/InputField.vue'
import InputText from '~/core/ui/inputs/InputText.vue'
import type { Module, ModuleList } from '../../types/modules.types'
import {
  blockNonDigitKeydown,
  emptyModuleFormErrors,
  emptyModuleFormValues,
  extractDigitsFromClipboard,
  formatModulePriceInput,
  mapModuleListToFormValues,
  parseModuleForm,
  sanitizeModuleCode,
  validateModuleForm,
  type ModuleFormErrors,
} from '../../schema/module.schema'

defineOptions({
  name: 'FormModule',
})

const props = withDefaults(defineProps<{
  mode?: 'create' | 'edit'
  initialModule?: ModuleList | Module | null
}>(), {
  mode: 'create',
  initialModule: null,
})

const emit = defineEmits<{
  submit: [payload: Module]
}>()

const form = reactive(emptyModuleFormValues())
const errors = reactive<ModuleFormErrors>(emptyModuleFormErrors())

const applyFieldErrors = (fieldErrors: ModuleFormErrors) => {
  Object.assign(errors, fieldErrors)
}

const validateField = (field: keyof ModuleFormErrors) => {
  const fieldErrors = validateModuleForm({ ...form })
  errors[field] = fieldErrors[field]
}

const onCodeInput = (event: Event) => {
  form.code = sanitizeModuleCode((event.target as HTMLInputElement).value)
  errors.code = ''
}

const onCodePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  form.code = sanitizeModuleCode(event.clipboardData?.getData('text') ?? '')
  errors.code = ''
}

const onPriceInput = (event: Event) => {
  form.price = formatModulePriceInput((event.target as HTMLInputElement).value)
  errors.price = ''
}

const onPricePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  form.price = formatModulePriceInput(extractDigitsFromClipboard(event))
  errors.price = ''
}

const reset = () => {
  Object.assign(form, emptyModuleFormValues())
  Object.assign(errors, emptyModuleFormErrors())
}

const setValues = (module: ModuleList | Module) => {
  Object.assign(form, mapModuleListToFormValues(module))
  Object.assign(errors, emptyModuleFormErrors())
}

watch(
  () => props.initialModule,
  (module) => {
    if (!module) return
    setValues(module)
  },
  { immediate: true },
)

const handleSubmit = () => {
  const fieldErrors = validateModuleForm({ ...form })
  applyFieldErrors(fieldErrors)

  const result = parseModuleForm({ ...form })
  if (!result.success) {
    applyFieldErrors(result.errors)
    return
  }

  Object.assign(errors, emptyModuleFormErrors())
  emit('submit', result.data)
}

defineExpose({
  submit: handleSubmit,
  reset,
  setValues,
})
</script>
