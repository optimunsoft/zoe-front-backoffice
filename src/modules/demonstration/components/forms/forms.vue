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

    <div>
      <InputField
        label="Teléfono"
        html-for="demonstration-phone-number"
        required
        :error="phoneFieldError"
      >
        <div class="flex items-start gap-2">
          <div class="w-25 shrink-0">
            <InputSelect
              id="demonstration-phone-prefix"
              :model-value="form.phonePrefix"
              name="phonePrefix"
              placeholder="Prefijo"
              required
              compact-selected
              teleport-dropdown
              :options="phonePrefixOptions"
              select-class="!pr-8"
              @update:model-value="onPhonePrefixChange"
            />
          </div>

          <div class="min-w-0 flex-1">
            <InputText
              id="demonstration-phone-number"
              :model-value="form.phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="3000000000"
              required
              digits-only
              :max-length="15"
              @update:model-value="onPhoneNumberChange"
            />
          </div>
        </div>
      </InputField>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <Datepicker
        id="demonstration-date"
        v-model="form.scheduledDate"
        label="Fecha programada"
        mode="single"
        full-width
        required
      />
      <InputTime
        id="demonstration-time"
        v-model="form.scheduledTime"
        name="scheduledTime"
        label="Hora"
        required
        :error="errors.scheduledTime"
        @update:model-value="errors.scheduledTime = ''"
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
import { computed, onMounted, reactive, watch } from 'vue'

import { useUbicationStore } from '~/core/ubication/store/ubication.store'
import {
  DEFAULT_PHONE_PREFIX,
  formatPhonePrefixLabel,
  normalizePhonePrefixDigits,
  resolveDefaultPhonePrefix,
} from '~/core/ubication/utils/phone.utils'
import Datepicker from '~/core/ui/form/Datepicker.vue'
import InputCheckbox from '~/core/ui/inputs/InputCheckbox.vue'
import InputField from '~/core/ui/inputs/InputField.vue'
import InputSelect from '~/core/ui/inputs/InputSelect.vue'
import InputText from '~/core/ui/inputs/InputText.vue'
import InputTime from '~/core/ui/inputs/InputTime.vue'
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

const ubicationStore = useUbicationStore()

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
  phonePrefix: resolveDefaultPhonePrefix([]),
  phoneNumber: '',
  scheduledDate: null as string | Date | Date[] | null,
  scheduledTime: '',
  productInterest: [] as string[],
  status: '' as DemonstrationStatus | '',
})

const form = reactive(initialForm())
const errors = reactive<DemonstrationFormErrors>(emptyDemonstrationFormErrors())

const phonePrefixOptions = computed<InputSelectOption[]>(() => {
  const seen = new Set<string>()
  const options: InputSelectOption[] = []

  for (const country of ubicationStore.allCountries) {
    const value = normalizePhonePrefixDigits(country.phonePrefix)
    if (!value || seen.has(value)) continue

    seen.add(value)
    options.push({
      label: `${country.name} (${formatPhonePrefixLabel(value)})`,
      selectedLabel: formatPhonePrefixLabel(value),
      value,
    })
  }

  const currentPrefix = normalizePhonePrefixDigits(form.phonePrefix) || DEFAULT_PHONE_PREFIX
  if (!seen.has(currentPrefix)) {
    options.unshift({
      label: formatPhonePrefixLabel(currentPrefix),
      selectedLabel: formatPhonePrefixLabel(currentPrefix),
      value: currentPrefix,
    })
  }

  if (!options.length) {
    options.push({
      label: formatPhonePrefixLabel(DEFAULT_PHONE_PREFIX),
      selectedLabel: formatPhonePrefixLabel(DEFAULT_PHONE_PREFIX),
      value: DEFAULT_PHONE_PREFIX,
    })
  }

  return options
})

const phoneFieldError = computed(() => errors.phonePrefix || errors.phoneNumber)

const onNameChange = (value: string) => {
  form.name = sanitizeDemonstrationName(value)
  errors.name = ''
}

const onPhonePrefixChange = (value: string | number) => {
  form.phonePrefix = normalizePhonePrefixDigits(String(value))
  errors.phonePrefix = ''
}

const onPhoneNumberChange = (value: string) => {
  form.phoneNumber = sanitizeDemonstrationPhone(value)
  errors.phoneNumber = ''
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
  if (ubicationStore.allCountries.length) {
    form.phonePrefix = resolveDefaultPhonePrefix(ubicationStore.allCountries)
  }
  Object.assign(errors, emptyDemonstrationFormErrors())
}

const setValues = async (demonstration: DemonstrationResponse) => {
  if (!ubicationStore.allCountries.length) {
    await ubicationStore.getAllCountries()
  }

  const values = mapDemonstrationResponseToFormValues(
    demonstration,
    ubicationStore.allCountries,
  )

  form.name = values.name
  form.email = values.email
  form.phonePrefix = String(values.phonePrefix ?? DEFAULT_PHONE_PREFIX)
  form.phoneNumber = String(values.phoneNumber ?? '')
  form.scheduledDate = values.scheduledDate ?? null
  form.scheduledTime = values.scheduledTime
  form.status = (values.status ?? '') as DemonstrationStatus | ''
  form.productInterest = values.productInterest.map((item) => String(item))
  Object.assign(errors, emptyDemonstrationFormErrors())
}

watch(
  () => props.initialDemonstration,
  async (demonstration) => {
    if (props.mode !== 'edit' || !demonstration) return
    await setValues(demonstration)
  },
  { immediate: true },
)

const handleSubmit = () => {
  if (props.mode === 'edit') {
    const result = parseDemonstrationUpdateForm({
      name: form.name,
      email: form.email,
      phonePrefix: form.phonePrefix,
      phoneNumber: form.phoneNumber,
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

onMounted(async () => {
  await ubicationStore.getAllCountries()

  if (props.mode === 'create') {
    form.phonePrefix = resolveDefaultPhonePrefix(ubicationStore.allCountries) || DEFAULT_PHONE_PREFIX
    return
  }

  if (props.initialDemonstration) {
    await setValues(props.initialDemonstration)
  }
})

defineExpose({
  submit: handleSubmit,
  reset,
  setValues,
})
</script>
