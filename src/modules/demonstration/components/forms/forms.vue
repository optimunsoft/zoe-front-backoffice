<template>
  <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
    <InputText
      id="demonstration-name"
      :model-value="form.name"
      name="name"
      type="text"
      label="Nombre"
      placeholder="Nombre del contacto"
      required
      :error="errors.name"
      @update:model-value="onNameChange"
    />

    <InputText
      id="demonstration-email"
      v-model="form.email"
      name="email"
      type="email"
      label="Email"
      placeholder="correo@empresa.com"
      required
      :error="errors.email"
    />

    <InputText
      id="demonstration-phone"
      :model-value="form.phone"
      name="phone"
      type="tel"
      label="Teléfono"
      placeholder="3000000000"
      required
      input-class="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      :error="errors.phone"
      @update:model-value="onPhoneChange"
    />

    <div class="grid gap-4 sm:grid-cols-2">
      <Datepicker
        id="demonstration-date"
        v-model="form.scheduledDate"
        label="Fecha programada"
        mode="single"
        full-width
        required
      />
      <InputText
        id="demonstration-time"
        v-model="form.scheduledTime"
        name="scheduledTime"
        type="time"
        label="Hora"
        required
        :error="errors.scheduledTime"
      />
    </div>
    <p v-if="errors.scheduledDate" class="text-xs text-red-500 -mt-2">
      {{ errors.scheduledDate }}
    </p>

    <InputField
      label="Productos de interés"
      html-for="demonstration-products"
      required
      :error="errors.productInterest"
    >
      <div id="demonstration-products" class="space-y-2">
        <InputCheckbox
          v-for="option in productOptions"
          :key="option.value"
          :model-value="form.productInterest.includes(String(option.value))"
          :label="option.label"
          @update:model-value="(checked) => toggleProduct(String(option.value), checked)"
        />
      </div>
    </InputField>

    <InputSelect
      v-if="mode === 'edit'"
      id="demonstration-status"
      v-model="form.status"
      name="status"
      label="Estado"
      placeholder="Seleccionar estado"
      required
      :options="statusOptions"
      :error="errors.status"
    />

  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

import Datepicker from '~/core/ui/form/Datepicker.vue'
import InputCheckbox from '~/core/ui/inputs/InputCheckbox.vue'
import InputField from '~/core/ui/inputs/InputField.vue'
import InputSelect from '~/core/ui/inputs/InputSelect.vue'
import InputText from '~/core/ui/inputs/InputText.vue'
import type { InputSelectOption } from '~/core/ui/inputs/input.types'
import type { Demonstration, DemonstrationResponse, UpdateDemonstration } from '../../types/demonstration.types'
import { DemonstrationStatus } from '../../types/demonstration.types'
import {
  emptyDemonstrationFormErrors,
  mapDemonstrationResponseToFormValues,
  parseDemonstrationForm,
  parseDemonstrationUpdateForm,
  sanitizeDemonstrationName,
  sanitizeDemonstrationPhone,
  type DemonstrationFormErrors,
} from '../../schema/demonstrations.schema'

defineOptions({
  name: 'FormDemonstration',
})

const props = withDefaults(defineProps<{
  mode?: 'create' | 'edit'
  initialDemonstration?: DemonstrationResponse | null
}>(), {
  mode: 'create',
  initialDemonstration: null,
})

const emit = defineEmits<{
  submit: [payload: Demonstration | UpdateDemonstration]
}>()

const productOptions: InputSelectOption[] = [
  { label: 'Contabilidad', value: 'Contabilidad' },
  { label: 'Factura Electronica', value: 'Factura Electronica' },
  { label: 'Administrativo de Escritorio', value: 'Administrativo de Escritorio' },
]

const statusOptions: InputSelectOption[] = [
  { label: 'Pendiente', value: DemonstrationStatus.PENDIENTE },
  { label: 'Ejecutada', value: DemonstrationStatus.EJECUTADA },
  { label: 'Cancelada', value: DemonstrationStatus.CANCELADA },
]

const initialForm = () => ({
  name: '',
  email: '',
  phone: '',
  scheduledDate: null as string | Date | Date[] | null,
  scheduledTime: '',
  productInterest: [] as string[],
  status: '' as DemonstrationStatus | '',
})

const form = reactive(initialForm())

const errors = reactive<DemonstrationFormErrors>(emptyDemonstrationFormErrors())

const onNameChange = (value: string) => {
  form.name = sanitizeDemonstrationName(value)
  errors.name = ''
}

const onPhoneChange = (value: string) => {
  form.phone = sanitizeDemonstrationPhone(value)
  errors.phone = ''
}

const toggleProduct = (product: string, checked: boolean) => {
  if (checked) {
    if (!form.productInterest.includes(product)) {
      form.productInterest.push(product)
    }
  } else {
    form.productInterest = form.productInterest.filter((item) => item !== product)
  }

  errors.productInterest = ''
}

const reset = () => {
  Object.assign(form, initialForm())
  Object.assign(errors, emptyDemonstrationFormErrors())
}

const setValues = (demonstration: DemonstrationResponse) => {
  const values = mapDemonstrationResponseToFormValues(demonstration)

  form.name = values.name
  form.email = values.email
  form.phone = values.phone
  form.scheduledDate = values.scheduledDate ?? null
  form.scheduledTime = values.scheduledTime
  form.status = values.status ?? ''
  form.productInterest = [...values.productInterest]
  Object.assign(errors, emptyDemonstrationFormErrors())
}

watch(
  () => props.initialDemonstration,
  (demonstration) => {
    if (props.mode !== 'edit' || !demonstration) return
    setValues(demonstration)
  },
  { immediate: true },
)

const handleSubmit = () => {
  if (props.mode === 'edit') {
    const result = parseDemonstrationUpdateForm({
      name: form.name,
      email: form.email,
      phone: form.phone,
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      productInterest: form.productInterest,
      status: form.status,
    })

    if (!result.success) {
      Object.assign(errors, result.errors)
      return
    }

    Object.assign(errors, emptyDemonstrationFormErrors())
    emit('submit', result.data)
    return
  }

  const result = parseDemonstrationForm({ ...form })

  if (!result.success) {
    Object.assign(errors, result.errors)
    return
  }

  Object.assign(errors, emptyDemonstrationFormErrors())
  emit('submit', result.data)
}

defineExpose({
  submit: handleSubmit,
  reset,
  setValues,
})
</script>
