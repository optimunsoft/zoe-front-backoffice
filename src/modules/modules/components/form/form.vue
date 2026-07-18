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

    <div
      class="flex min-h-15 items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5 dark:border-gray-700/60"
    >
      <label
        class="text-sm font-medium text-gray-800 dark:text-gray-100"
        for="module-active"
      >
        Módulo activo
      </label>
      <InputSwitch
        id="module-active"
        :model-value="form.active"
        label="Módulo activo"
        :show-state-label="false"
        on-label="Activo"
        off-label="Inactivo"
        wrapper-class="shrink-0"
        @update:model-value="onModuleStatusToggle"
      />
    </div>
  </form>

  <ModalAction
    id="confirm-module-active-status-modal"
    :modal-open="statusModalOpen"
    @close-modal="cancelModuleStatusChange"
  >
    <div class="text-center">
      <div
        class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full"
        :class="pendingModuleStatus
          ? 'bg-violet-100 dark:bg-violet-500/20'
          : 'bg-amber-100 dark:bg-amber-500/20'"
      >
        <svg
          class="size-6 fill-current"
          :class="pendingModuleStatus ? 'text-violet-500' : 'text-amber-500'"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path
            v-if="pendingModuleStatus"
            d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.7 5.3l-4.2 4.2c-.2.2-.5.2-.7 0L4.3 7.8c-.2-.2-.2-.5 0-.7l.7-.7c.2-.2.5-.2.7 0l1.8 1.8 3.5-3.5c.2-.2.5-.2.7 0l.7.7c.2.2.2.5 0 .7z"
          />
          <path
            v-else
            d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 11H7V7h2v4zm0-6H7V3h2v2z"
          />
        </svg>
      </div>

      <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
        {{ pendingModuleStatus ? '¿Activar módulo?' : '¿Desactivar módulo?' }}
      </h3>

      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {{
          pendingModuleStatus
            ? 'El módulo quedará activo y disponible en el sistema.'
            : 'El módulo quedará inactivo y no estará disponible en el sistema.'
        }}
      </p>

      <div class="flex justify-center gap-2">
        <Button variant="secondary" @click="cancelModuleStatusChange">
          Cancelar
        </Button>
        <Button
          :variant="pendingModuleStatus ? 'primary' : 'danger'"
          @click="confirmModuleStatusChange"
        >
          {{ pendingModuleStatus ? 'Activar' : 'Desactivar' }}
        </Button>
      </div>
    </div>
  </ModalAction>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

import { Button } from '~/core/ui/buttons'
import InputField from '~/core/ui/inputs/InputField.vue'
import InputSwitch from '~/core/ui/inputs/InputSwitch.vue'
import InputText from '~/core/ui/inputs/InputText.vue'
import { ModalAction } from '~/core/ui/modal'
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
const statusModalOpen = ref(false)
const pendingModuleStatus = ref<boolean | null>(null)

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

const resetStatusModal = () => {
  statusModalOpen.value = false
  pendingModuleStatus.value = null
}

const onModuleStatusToggle = (active: boolean) => {
  if (form.active === active) return

  pendingModuleStatus.value = active
  statusModalOpen.value = true
}

const cancelModuleStatusChange = () => {
  resetStatusModal()
}

const confirmModuleStatusChange = () => {
  if (pendingModuleStatus.value === null) return

  form.active = pendingModuleStatus.value
  resetStatusModal()
}

const reset = () => {
  Object.assign(form, emptyModuleFormValues())
  Object.assign(errors, emptyModuleFormErrors())
  resetStatusModal()
}

const setValues = (module: ModuleList | Module) => {
  Object.assign(form, mapModuleListToFormValues(module))
  Object.assign(errors, emptyModuleFormErrors())
  resetStatusModal()
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
