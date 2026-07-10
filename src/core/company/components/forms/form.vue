<template>
  <div class="relative min-h-96">
    <div
      v-if="!isFormReady"
      class="absolute inset-0 z-10 flex items-center justify-center bg-white dark:bg-gray-800"
    >
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Cargando formulario...
      </p>
    </div>

    <form
      class="space-y-5"
      :class="{ invisible: !isFormReady }"
      :aria-hidden="!isFormReady"
      novalidate
      @submit.prevent="handleSubmit"
    >
    <CompanyDataSection
      v-if="!isEditMode"
      ref="dataSectionRef"
      v-model:form="form"
      v-model:errors="errors"
      :mode="mode"
      :company-id="editingCompanyId"
      :is-natural-person="isNaturalPerson"
      :is-juridica-person="isJuridicaPerson"
      :is-syncing-form="isSyncingForm"
      :document-type-options="documentTypeOptions"
      :vat-regime-options="vatRegimeOptions"
      :tax-responsibility-options="taxResponsibilityOptions"
      :business-nature-options="businessNatureOptions"
    />

    <UTabs
      v-else
      v-model="activeFormTab"
      variant="underline"
      :items="formTabs"
      aria-label="Secciones del formulario de empresa"
      wrapper-class="mb-2"
    >
      <template #company-data>
        <CompanyDataSection
          ref="dataSectionRef"
          v-model:form="form"
          v-model:errors="errors"
          :mode="mode"
          :company-id="editingCompanyId"
          :is-natural-person="isNaturalPerson"
          :is-juridica-person="isJuridicaPerson"
          :is-syncing-form="isSyncingForm"
          :document-type-options="documentTypeOptions"
          :vat-regime-options="vatRegimeOptions"
          :tax-responsibility-options="taxResponsibilityOptions"
          :business-nature-options="businessNatureOptions"
        />
      </template>

      <template #company-config>
        <CompanyConfigSection
          ref="configSectionRef"
          :form="form"
          :company-id="editingCompanyId"
          :is-updating-company-status="isUpdatingCompanyStatus"
          @update:is-active="onCompanyStatusChange"
        />
      </template>
    </UTabs>
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
import { useUsersStore } from '~/modules/administration/users/store/users.store'
import { UTabs } from '~/core/ui/tabs'
import type { UiTabItem } from '~/core/ui/tabs'
import type { InputSelectOption } from '~/core/ui/inputs/input.types'
import type { Company, CompanyRequestBody, CompanyUpdateRequestBody } from '../../types/company.types'
import {
  emptyCompanyFormErrors,
  emptyCompanyFormValues,
  mapCompanyToFormValues,
  normalizeCompanyListItem,
  parseCompanyForm,
  type CompanyFormErrors,
} from '../../schema/company.schema'
import { useCompanyStore } from '../../store/company.store'
import { useNitCheckDigit } from '../../composables/use-nit-check-digit'
import CompanyDataSection from './CompanyDataSection.vue'
import CompanyConfigSection from './CompanyConfigSection.vue'

defineOptions({
  name: 'FormCompany',
})

const props = withDefaults(defineProps<{
  mode?: 'create' | 'edit'
}>(), {
  mode: 'create',
})

const emit = defineEmits<{
  submit: [payload: CompanyRequestBody | CompanyUpdateRequestBody]
  'status-updated': [active: boolean]
}>()

const isEditMode = computed(() => props.mode === 'edit')

const formTabs: UiTabItem[] = [
  { key: 'company-data', label: 'Datos de empresa' },
  { key: 'company-config', label: 'Configuración de empresa' },
]

const activeFormTab = ref('company-data')

const catalogStore = useCatalogStore()
const businessNatureStore = useBusinessNatureStore()
const documentTypeStore = useDocumentTypeStore()
const taxResponsibilityStore = useTaxResponsibilityStore()
const vatRegimeStore = useVatRegimeStore()
const usersStore = useUsersStore()
const companyStore = useCompanyStore()

const form = reactive(emptyCompanyFormValues())
const errors = reactive<CompanyFormErrors>(emptyCompanyFormErrors())
const editingCompanyId = ref<string | null>(null)
const isUpdatingCompanyStatus = ref(false)
const isSyncingForm = ref(false)
const isFormReady = ref(false)

const dataSectionRef = ref<InstanceType<typeof CompanyDataSection> | null>(null)
const configSectionRef = ref<InstanceType<typeof CompanyConfigSection> | null>(null)

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

const onCompanyStatusChange = async (active: boolean) => {
  if (form.isActive === active || isSyncingForm.value) return

  if (!isEditMode.value || !editingCompanyId.value) {
    form.isActive = active
    return
  }

  const previousValue = form.isActive
  form.isActive = active
  isUpdatingCompanyStatus.value = true

  try {
    await companyStore.getStatusCompanies(editingCompanyId.value, active)
    emit('status-updated', active)
  } catch {
    form.isActive = previousValue
  } finally {
    isUpdatingCompanyStatus.value = false
  }
}

const ensureUsersLoaded = async () => {
  if (usersStore.users.length > 0) return
  await usersStore.getUsers({ page: 1, amount: 100 })
}

const clearFormState = () => {
  Object.assign(form, emptyCompanyFormValues())
  Object.assign(errors, emptyCompanyFormErrors())
  editingCompanyId.value = null
  isUpdatingCompanyStatus.value = false
  activeFormTab.value = 'company-data'
  dataSectionRef.value?.reset()
  configSectionRef.value?.reset()
}

const reset = () => {
  isFormReady.value = false
  clearFormState()
}

const waitForSectionRefs = async () => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await nextTick()

    if (isEditMode.value) {
      if (dataSectionRef.value && configSectionRef.value) return
      continue
    }

    if (dataSectionRef.value) return
  }
}

const populateCompany = async (company: Company) => {
  const normalizedCompany = normalizeCompanyListItem(company)
  isSyncingForm.value = true

  try {
    Object.assign(form, mapCompanyToFormValues(normalizedCompany))
    Object.assign(errors, emptyCompanyFormErrors())
    editingCompanyId.value = normalizedCompany.id || null

    await waitForSectionRefs()

    await Promise.all([
      dataSectionRef.value?.setFromCompany(normalizedCompany, { mode: props.mode }),
      isEditMode.value
        ? configSectionRef.value?.setFromCompany(normalizedCompany)
        : Promise.resolve(),
    ])
  } finally {
    await nextTick()
    isSyncingForm.value = false
  }
}

const initialize = async (company?: Company) => {
  isFormReady.value = false
  clearFormState()

  await catalogStore.preload()
  await ensureUsersLoaded()
  await waitForSectionRefs()

  if (company) {
    await populateCompany(company)
  }

  isFormReady.value = true
}

const setValues = async (company: Company) => {
  await initialize(company)
}

const handleSubmit = () => {
  const result = parseCompanyForm(form, {
    isNaturalPerson: isNaturalPerson.value,
    isJuridicaPerson: isJuridicaPerson.value,
    mode: props.mode,
  })

  if (!result.success) {
    Object.assign(errors, result.errors)
    activeFormTab.value = 'company-data'
    return
  }

  Object.assign(errors, emptyCompanyFormErrors())
  emit('submit', result.data)
}

defineExpose({
  submit: handleSubmit,
  reset,
  initialize,
  setValues,
  isFormReady,
  uploadCompanyLogoIfNeeded: async (
    companyId: string,
    options?: { skipNotification?: boolean },
  ) => {
    await dataSectionRef.value?.uploadLogoIfNeeded(companyId, options)
  },
})
</script>
