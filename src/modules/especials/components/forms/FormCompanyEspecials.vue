<template>
  <div class="relative">
    <div
      v-if="!isFormReady"
      class="flex min-h-40 items-center justify-center bg-white dark:bg-gray-800"
    >
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Cargando formulario...
      </p>
    </div>

    <form
      v-show="isFormReady"
      class="space-y-5"
      :class="{ 'pointer-events-none': disabled }"
      :aria-busy="disabled || undefined"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <CompanyDataSectionEspecials
        ref="dataSectionRef"
        v-model:form="form"
        v-model:errors="errors"
        :section="section"
        :disabled="disabled"
        :is-natural-person="isNaturalPerson"
        :is-juridica-person="isJuridicaPerson"
        :is-syncing-form="isSyncingForm"
        :document-type-options="documentTypeOptions"
        :vat-regime-options="vatRegimeOptions"
        :tax-responsibility-options="taxResponsibilityOptions"
        :business-nature-options="businessNatureOptions"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, toRef } from 'vue'

import { useCatalogStore } from '~/core/catalog/store/catalog.store'
import { useBusinessNatureStore } from '~/core/businessNature/store/businessNature.store'
import { useDocumentTypeStore } from '~/core/documentType/store/documentType.store'
import { useTaxResponsibilityStore } from '~/core/taxResponsibility/store/taxResponsibility.store'
import { useVatRegimeStore } from '~/core/vatRegime/store/vatRegime.store'
import type { InputSelectOption } from '~/core/ui/inputs/input.types'
import type { CompanyRequestBody, CompanyUpdateRequestBody } from '~/core/company/types/company.types'
import {
  emptyCompanyFormErrors,
  emptyCompanyFormValues,
  parseCompanyForm,
  type CompanyFormErrors,
  type CompanyFormValues,
} from '~/core/company/schema/company.schema'
import { useNitCheckDigit } from '~/core/company/composables/use-nit-check-digit'
import CompanyDataSectionEspecials from './CompanyDataSectionEspecials.vue'

defineOptions({
  name: 'FormCompanyEspecials',
})

const props = withDefaults(defineProps<{
  production?: boolean | null
  section?: 'general' | 'additional'
  /** Bloquea el formulario (p. ej. mientras se procesa el RUT). */
  disabled?: boolean
}>(), {
  production: true,
  section: 'general',
  disabled: false,
})

const emit = defineEmits<{
  submit: [payload: CompanyRequestBody | CompanyUpdateRequestBody]
}>()

const GENERAL_FIELDS: Array<keyof CompanyFormValues> = [
  'documentTypeId',
  'documentNumber',
  'verificationDigit',
  'businessNatureId',
  'businessName',
  'firstName',
  'middleName',
  'lastName',
  'secondLastName',
  'address',
  'email',
  'municipalityId',
]

const catalogStore = useCatalogStore()
const businessNatureStore = useBusinessNatureStore()
const documentTypeStore = useDocumentTypeStore()
const taxResponsibilityStore = useTaxResponsibilityStore()
const vatRegimeStore = useVatRegimeStore()

const form = reactive(emptyCompanyFormValues())
const errors = reactive<CompanyFormErrors>(emptyCompanyFormErrors())
const isSyncingForm = ref(false)
const isFormReady = ref(false)

const dataSectionRef = ref<InstanceType<typeof CompanyDataSectionEspecials> | null>(null)

useNitCheckDigit(toRef(form, 'documentNumber'), {
  onDigitChange: (digit) => {
    form.verificationDigit = digit
    errors.verificationDigit = ''
  },
})

const normalizeCatalogLabel = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

const toSelectOptions = (items: { id: string, name: string }[]): InputSelectOption[] =>
  items.map((item) => ({ label: item.name, value: item.id }))

const documentTypeOptions = computed(() => toSelectOptions(documentTypeStore.documentTypes))
const taxResponsibilityOptions = computed(() => toSelectOptions(taxResponsibilityStore.taxResponsibilities))
const vatRegimeOptions = computed(() => toSelectOptions(vatRegimeStore.vatRegimes))
const businessNatureOptions = computed(() => toSelectOptions(businessNatureStore.businessNatures))

const selectedBusinessNature = computed(() =>
  businessNatureStore.businessNatures.find((item) => item.id === form.businessNatureId),
)

const isNaturalPerson = computed(() => {
  const name = selectedBusinessNature.value?.name ?? ''
  return normalizeCatalogLabel(name).includes('persona natural')
})

const isJuridicaPerson = computed(() => {
  const name = selectedBusinessNature.value?.name ?? ''
  return normalizeCatalogLabel(name).includes('persona juridica')
})

const displayName = computed(() => {
  const businessName = form.businessName.trim()
  if (businessName) return businessName

  const tradeName = form.tradeName.trim()
  if (tradeName) return tradeName

  return [form.firstName, form.middleName, form.lastName, form.secondLastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ')
})

const clearFormState = () => {
  Object.assign(form, emptyCompanyFormValues())
  if (props.production != null) {
    form.production = Boolean(props.production)
  }
  Object.assign(errors, emptyCompanyFormErrors())
  dataSectionRef.value?.reset()
}

const reset = () => {
  isFormReady.value = false
  clearFormState()
}

const waitForSectionRefs = async () => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await nextTick()
    if (dataSectionRef.value) return
  }
}

const initialize = async () => {
  isFormReady.value = false
  clearFormState()

  await catalogStore.preload()
  await waitForSectionRefs()

  isFormReady.value = true
}

const parseOptions = () => ({
  isNaturalPerson: isNaturalPerson.value,
  isJuridicaPerson: isJuridicaPerson.value,
  mode: 'create' as const,
  skipOwnerUserId: true,
  production: form.production,
})

/** Valida solo campos de información general (permite avanzar sin IVA/responsabilidad). */
const validateGeneral = (): boolean => {
  const result = parseCompanyForm(form, parseOptions())
  Object.assign(errors, emptyCompanyFormErrors())

  if (result.success) return true

  let hasGeneralError = false
  for (const field of GENERAL_FIELDS) {
    const message = result.errors[field]
    if (message) {
      errors[field] = message
      hasGeneralError = true
    }
  }

  return !hasGeneralError
}

const handleSubmit = () => {
  const result = parseCompanyForm(form, parseOptions())

  if (!result.success) {
    Object.assign(errors, result.errors)
    return
  }

  Object.assign(errors, emptyCompanyFormErrors())
  emit('submit', result.data)
}

const setFormValues = async (values: Partial<typeof form>) => {
  isSyncingForm.value = true
  try {
    Object.assign(form, values)
  } finally {
    isSyncingForm.value = false
  }

  if (!values.municipalityId?.trim()) return

  await nextTick()
  try {
    await dataSectionRef.value?.municipalityFieldRef?.syncLabelFromModel?.()
  } catch {
    // Si falla la etiqueta del municipio, no bloquear el flujo del RUT.
  }
}

defineExpose({
  submit: handleSubmit,
  validateGeneral,
  reset,
  initialize,
  setFormValues,
  isFormReady,
  displayName,
  form,
  getValues: () => ({ ...form }),
})
</script>

