<template>
  <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
    <div class="grid gap-4 lg:grid-cols-3">
      <div v-if="!isEditMode" class="min-w-0 lg:col-span-2">
        <template v-if="!selectedOwner">
          <InputField
            label="Dueño de la empresa"
            html-for="company-owner-search"
            required
            :error="errors.ownerUserId"
          >
            <div class="flex items-center gap-2">
              <div class="relative min-w-0 flex-1">
                <input
                  id="company-owner-search"
                  v-model="ownerSearch"
                  type="text"
                  name="ownerSearch"
                  placeholder="Buscar usuario por nombre o correo..."
                  class="form-input w-full"
                  @input="onOwnerSearchInput(($event.target as HTMLInputElement).value)"
                >

                <div
                  v-if="showOwnerSuggestions"
                  class="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700/60 dark:bg-gray-800"
                >
                  <button
                    v-for="user in ownerSearchResults"
                    :key="user.id"
                    type="button"
                    class="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-800/60"
                    :class="pendingOwner?.id === user.id ? 'bg-violet-50 dark:bg-violet-500/10' : ''"
                    @click="selectOwnerCandidate(user)"
                  >
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                        {{ formatUserDisplayName(user) }}
                      </p>
                      <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                        {{ user.email }}
                      </p>
                    </div>
                    <span
                      v-if="pendingOwner?.id === user.id"
                      class="shrink-0 text-xs font-medium text-violet-500"
                    >
                      Seleccionado
                    </span>
                  </button>

                  <p
                    v-if="ownerSearchResults.length === 0 && !isSearchingOwners"
                    class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
                  >
                    No se encontraron usuarios con ese criterio.
                  </p>

                  <p
                    v-else-if="isSearchingOwners"
                    class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
                  >
                    Buscando...
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="primary"
                class="shrink-0"
                :disabled="!canAddOwner"
                @click="confirmAddOwner"
              >
                <template #icon>
                  <UiIcon name="plus" size="sm" />
                </template>
                Agregar
              </Button>
            </div>
          </InputField>
        </template>

        <InputField
          v-else
          label="Dueño de la empresa"
          required
          :error="errors.ownerUserId"
        >
          <div
            class="flex items-center justify-between gap-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2.5 dark:border-violet-500/30 dark:bg-violet-500/10"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                {{ formatUserDisplayName(selectedOwner) }}
              </p>
              <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                {{ selectedOwner.email }}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              class="shrink-0"
              @click="removeOwner"
            >
              Quitar
            </Button>
          </div>
        </InputField>
      </div>

      <div class="min-w-0" :class="{ 'lg:col-start-1': !isEditMode }">
        <InputSelect
          id="company-document-type"
          v-model="form.documentTypeId"
          name="documentTypeId"
          label="Tipo de identificación"
          placeholder="Seleccionar"
          required
          :options="documentTypeOptions"
          :error="errors.documentTypeId"
        />
      </div>

      <div class="grid min-w-0 grid-cols-[minmax(0,1fr)_4.5rem] gap-2">
        <InputText
          id="company-document-number"
          :model-value="form.documentNumber"
          name="documentNumber"
          label="NIT"
          placeholder="900123456"
          required
          input-class="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          :error="errors.documentNumber"
          @update:model-value="onDocumentNumberChange"
        />
        <InputText
          id="company-verification-digit"
          :model-value="form.verificationDigit"
          name="verificationDigit"
          label="DV"
          placeholder="--"
          input-class="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          :error="errors.verificationDigit"
          @update:model-value="onVerificationDigitChange"
        />
      </div>

      <div class="min-w-0">
        <InputSelect
          id="company-vat-regime"
          v-model="form.vatRegimeId"
          name="vatRegimeId"
          label="Régimen de IVA"
          placeholder="Seleccionar"
          required
          :options="vatRegimeOptions"
          :error="errors.vatRegimeId"
        />
      </div>

      <div class="min-w-0">
        <InputSelect
          id="company-tax-responsibility"
          v-model="form.taxResponsibilityId"
          name="taxResponsibilityId"
          label="Responsabilidad tributaria"
          placeholder="Seleccionar"
          required
          :options="taxResponsibilityOptions"
          :error="errors.taxResponsibilityId"
        />
      </div>

      <div class="min-w-0">
        <InputSelect
          id="company-business-nature"
          v-model="form.businessNatureId"
          name="businessNatureId"
          label="Tipo de persona"
          placeholder="Seleccionar"
          required
          :options="businessNatureOptions"
          :error="errors.businessNatureId"
          @update:model-value="onBusinessNatureChange"
        />
      </div>

      <div class="min-w-0">
        <InputText
          id="company-business-name"
          v-model="form.businessName"
          name="businessName"
          label="Razón social"
          placeholder="Razón social"
          :required="isJuridicaPerson"
          :error="errors.businessName"
        />
      </div>
    </div>

    <div v-if="isNaturalPerson" class="grid gap-4 lg:grid-cols-3">
      <InputText
        id="company-first-name"
        :model-value="form.firstName"
        name="firstName"
        label="Primer nombre"
        placeholder="Primer nombre"
        required
        :error="errors.firstName"
        @update:model-value="onFirstNameChange"
      />
      <InputText
        id="company-middle-name"
        :model-value="form.middleName"
        name="middleName"
        label="Segundo nombre"
        placeholder="Segundo nombre"
        :error="errors.middleName"
        @update:model-value="onMiddleNameChange"
      />
      <InputText
        id="company-last-name"
        :model-value="form.lastName"
        name="lastName"
        label="Primer apellido"
        placeholder="Primer apellido"
        required
        :error="errors.lastName"
        @update:model-value="onLastNameChange"
      />
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div v-if="isNaturalPerson" class="min-w-0">
        <InputText
          id="company-second-last-name"
          :model-value="form.secondLastName"
          name="secondLastName"
          label="Segundo apellido"
          placeholder="Segundo apellido"
          :error="errors.secondLastName"
          @update:model-value="onSecondLastNameChange"
        />
      </div>

      <div class="min-w-0">
        <InputField
          label="Municipio"
          html-for="company-municipality-search"
          required
          :error="errors.municipalityId"
        >
          <div class="relative">
            <input
              id="company-municipality-search"
              v-model="municipalitySearch"
              type="text"
              name="municipalitySearch"
              placeholder="Buscar municipio..."
              class="form-input w-full"
              @input="onMunicipalitySearchInput(($event.target as HTMLInputElement).value)"
            >

            <div
              v-if="showMunicipalitySuggestions"
              class="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700/60 dark:bg-gray-800"
            >
              <button
                v-for="municipality in municipalityResults"
                :key="municipality.id"
                type="button"
                class="flex w-full items-center border-b border-gray-100 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-800/60"
                @click="selectMunicipality(municipality)"
              >
                <p class="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                  {{ municipality.label }}
                </p>
              </button>

              <p
                v-if="municipalityResults.length === 0 && !isSearchingMunicipalities"
                class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
              >
                No se encontraron municipios con ese criterio.
              </p>

              <p
                v-else-if="isSearchingMunicipalities"
                class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
              >
                Buscando...
              </p>
            </div>
          </div>
        </InputField>
      </div>

      <div class="min-w-0">
        <InputText
          id="company-address"
          v-model="form.address"
          name="address"
          label="Dirección"
          placeholder="Calle 123 #45-67"
          required
          :error="errors.address"
        />
      </div>

      <div v-if="isNaturalPerson || isJuridicaPerson" class="min-w-0">
        <InputText
          id="company-email"
          v-model="form.email"
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="contacto@empresa.com"
          required
          :error="errors.email"
        />
      </div>

      <div class="min-w-0">
        <InputText
          id="company-accountant-name"
          :model-value="form.accountantName"
          name="accountantName"
          label="Nombre del contador"
          placeholder="Nombre del contador"
          :error="errors.accountantName"
          @update:model-value="onAccountantNameChange"
        />
      </div>

      <div class="min-w-0">
        <InputText
          id="company-professional-card"
          v-model="form.professionalCardNumber"
          name="professionalCardNumber"
          label="N° Tarjeta profesional"
          placeholder="N° Tarjeta profesional"
          :error="errors.professionalCardNumber"
        />
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

import { useCatalogStore } from '~/core/catalog/store/catalog.store'
import { useBusinessNatureStore } from '~/core/businessNature/store/businessNature.store'
import { useDocumentTypeStore } from '~/core/documentType/store/documentType.store'
import { useTaxResponsibilityStore } from '~/core/taxResponsibility/store/taxResponsibility.store'
import { useVatRegimeStore } from '~/core/vatRegime/store/vatRegime.store'
import { useMunicipalityService } from '~/core/ubication/services/municipality.service'
import type { Municipality } from '~/core/ubication/types/municipality.interface'
import { useUsersStore } from '~/modules/administration/users/store/users.store'
import type { User } from '~/modules/administration/users/types/users.types'
import InputSelect from '~/core/ui/inputs/InputSelect.vue'
import InputText from '~/core/ui/inputs/InputText.vue'
import InputField from '~/core/ui/inputs/InputField.vue'
import { Button } from '~/core/ui/buttons'
import { UiIcon } from '~/core/ui/icons'
import type { InputSelectOption } from '~/core/ui/inputs/input.types'
import type { Company, CompanyRequestBody, CompanyUpdateRequestBody } from '../../types/company.types'
import {
  emptyCompanyFormErrors,
  emptyCompanyFormValues,
  mapCompanyToFormValues,
  normalizeCompanyListItem,
  parseCompanyForm,
  sanitizeCompanyDocumentNumber,
  sanitizeCompanyName,
  sanitizeVerificationDigit,
  type CompanyFormErrors,
} from '../../schema/company.schema'
import { useAuthStore } from '~/core/auth/store/auth.store'


const AuthStore = useAuthStore();

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
}>()

const isEditMode = computed(() => props.mode === 'edit')

const catalogStore = useCatalogStore()
const businessNatureStore = useBusinessNatureStore()
const documentTypeStore = useDocumentTypeStore()
const taxResponsibilityStore = useTaxResponsibilityStore()
const vatRegimeStore = useVatRegimeStore()
const municipalityService = useMunicipalityService()
const usersStore = useUsersStore()

const form = reactive(emptyCompanyFormValues())
const errors = reactive<CompanyFormErrors>(emptyCompanyFormErrors())
const ownerSearch = ref('')
const ownerSearchDebounced = refDebounced(ownerSearch, 300)
const ownerSearchResults = ref<User[]>([])
const pendingOwner = ref<User | null>(null)
const selectedOwner = ref<User | null>(null)
const isSearchingOwners = ref(false)
const municipalitySearch = ref('')
const municipalitySearchDebounced = refDebounced(municipalitySearch, 300)
const municipalityResults = ref<Array<{ id: string, label: string }>>([])
const isSearchingMunicipalities = ref(false)
const isSyncingMunicipalitySearch = ref(false)
const isSyncingForm = ref(false)

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

const formatUserDisplayName = (user: Pick<User, 'firstName' | 'lastName' | 'email'>) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return fullName || user.email
}

const formatUserSearchLabel = (user: Pick<User, 'firstName' | 'lastName' | 'email'>) => {
  const fullName = formatUserDisplayName(user)
  return fullName === user.email ? user.email : `${fullName} (${user.email})`
}

const filterUsersByTerm = (term: string) => {
  const normalized = term.trim().toLowerCase()
  if (!normalized) return []

  return usersStore.users
    .filter((user) => {
      const haystack = [user.firstName, user.lastName, user.email, user.username]
        .join(' ')
        .toLowerCase()
      return haystack.includes(normalized)
    })
    .slice(0, 20)
}

const canAddOwner = computed(() => Boolean(pendingOwner.value))

const showOwnerSuggestions = computed(() =>
  !selectedOwner.value
  && !pendingOwner.value
  && ownerSearch.value.trim().length > 0,
)

const isSyncingOwnerSearch = ref(false)

const selectOwnerCandidate = async (user: User) => {
  pendingOwner.value = user
  isSyncingOwnerSearch.value = true
  ownerSearch.value = formatUserSearchLabel(user)
  ownerSearchResults.value = []
  await nextTick()
  isSyncingOwnerSearch.value = false
  errors.ownerUserId = ''
}

const onOwnerSearchInput = (value: string) => {
  if (isSyncingOwnerSearch.value) return

  pendingOwner.value = null
  errors.ownerUserId = ''

  if (!value.trim()) {
    ownerSearchResults.value = []
  }
}

const searchOwners = async (term: string) => {
  const query = term.trim()
  ownerSearchResults.value = []

  if (!query || selectedOwner.value || pendingOwner.value) return

  isSearchingOwners.value = true

  try {
    await ensureUsersLoaded()
    ownerSearchResults.value = filterUsersByTerm(query)
  } finally {
    isSearchingOwners.value = false
  }
}

const confirmAddOwner = () => {
  if (!pendingOwner.value) {
    errors.ownerUserId = 'Selecciona un usuario de los resultados antes de agregar.'
    return
  }

  selectedOwner.value = pendingOwner.value
  form.ownerUserId = pendingOwner.value.id
  errors.ownerUserId = ''
  ownerSearch.value = ''
  ownerSearchResults.value = []
  pendingOwner.value = null
}

const removeOwner = () => {
  selectedOwner.value = null
  form.ownerUserId = ''
  ownerSearch.value = ''
  ownerSearchResults.value = []
  pendingOwner.value = null
  errors.ownerUserId = ''
}

const mapCompanyUserToOwner = (user: Company['users'][number]): User => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  username: user.email,
  userType: user.userType,
  isActive: user.isActive,
  isVerified: true,
  isAdmin: false,
})

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

const clearPersonFields = () => {
  form.businessName = ''
  form.firstName = ''
  form.middleName = ''
  form.lastName = ''
  form.secondLastName = ''
  errors.businessName = ''
  errors.firstName = ''
  errors.middleName = ''
  errors.lastName = ''
  errors.secondLastName = ''
}

const onBusinessNatureChange = (value: string | number) => {
  if (isSyncingForm.value) return

  form.businessNatureId = String(value)
  errors.businessNatureId = ''
  clearPersonFields()
}

const onDocumentNumberChange = (value: string) => {
  form.documentNumber = sanitizeCompanyDocumentNumber(value)
  errors.documentNumber = ''
}

const onVerificationDigitChange = (value: string) => {
  form.verificationDigit = sanitizeVerificationDigit(value)
  errors.verificationDigit = ''
}

const onFirstNameChange = (value: string) => {
  form.firstName = sanitizeCompanyName(value)
  errors.firstName = ''
}

const onMiddleNameChange = (value: string) => {
  form.middleName = sanitizeCompanyName(value)
  errors.middleName = ''
}

const onLastNameChange = (value: string) => {
  form.lastName = sanitizeCompanyName(value)
  errors.lastName = ''
}

const onSecondLastNameChange = (value: string) => {
  form.secondLastName = sanitizeCompanyName(value)
  errors.secondLastName = ''
}

const onAccountantNameChange = (value: string) => {
  form.accountantName = sanitizeCompanyName(value)
  errors.accountantName = ''
}

const formatMunicipalityLabel = (municipality: Pick<Municipality, 'name' | 'state'>) =>
  `${municipality.name} - ${municipality.state.name}`

const showMunicipalitySuggestions = computed(() =>
  !form.municipalityId && municipalitySearch.value.trim().length > 0,
)

const onMunicipalitySearchInput = (value: string) => {
  if (isSyncingMunicipalitySearch.value) return

  form.municipalityId = ''
  errors.municipalityId = ''

  if (!value.trim()) {
    municipalityResults.value = []
  }
}

const selectMunicipality = async (municipality: { id: string, label: string }) => {
  isSyncingMunicipalitySearch.value = true
  form.municipalityId = municipality.id
  municipalitySearch.value = municipality.label
  municipalityResults.value = []
  await nextTick()
  isSyncingMunicipalitySearch.value = false
  errors.municipalityId = ''
}

const fetchMunicipalities = async (params: { name?: string, countryId?: string }) => {
  isSearchingMunicipalities.value = true

  try {
    const { response } = await municipalityService.search({
      ...params,
      countryId: params.countryId ?? AuthStore.user?.countryId,
    })

    municipalityResults.value = (response ?? []).map((item) => ({
      id: item.id,
      label: formatMunicipalityLabel(item),
    }))
  } catch {
    municipalityResults.value = []
  } finally {
    isSearchingMunicipalities.value = false
  }
}

const ensureUsersLoaded = async () => {
  if (usersStore.users.length > 0) return
  await usersStore.getUsers({ page: 1, amount: 100 })
}

watch(ownerSearchDebounced, async (term) => {
  if (selectedOwner.value || pendingOwner.value) return
  await searchOwners(term)
})

watch(municipalitySearchDebounced, async (term) => {
  if (form.municipalityId) return

  const normalized = term.trim()
  if (!normalized) {
    municipalityResults.value = []
    return
  }

  await fetchMunicipalities({ name: normalized })
})

watch(
  () => form.municipalityId,
  (municipalityId) => {
    if (!municipalityId) return
    errors.municipalityId = ''
  },
)

const reset = () => {
  Object.assign(form, emptyCompanyFormValues())
  Object.assign(errors, emptyCompanyFormErrors())
  removeOwner()
  municipalitySearch.value = ''
  municipalityResults.value = []
  form.municipalityId = ''
}

const setValues = async (company: Company) => {
  await catalogStore.preload()

  const normalizedCompany = normalizeCompanyListItem(company)
  isSyncingForm.value = true

  try {
    Object.assign(form, mapCompanyToFormValues(normalizedCompany))
    Object.assign(errors, emptyCompanyFormErrors())
    removeOwner()

    if (!isEditMode.value) {
      const owner = normalizedCompany.users?.find((user) => user.isOwner)
      if (owner) {
        selectedOwner.value = mapCompanyUserToOwner(owner)
        form.ownerUserId = owner.id
      } else if (form.ownerUserId) {
        await ensureUsersLoaded()
        const user = usersStore.users.find((item) => item.id === form.ownerUserId)
        if (user) selectedOwner.value = user
      }
    }

    if (normalizedCompany.municipality?.id) {
      isSyncingMunicipalitySearch.value = true
      form.municipalityId = normalizedCompany.municipality.id
      municipalitySearch.value = normalizedCompany.municipality.state?.name
        ? formatMunicipalityLabel(normalizedCompany.municipality)
        : normalizedCompany.municipality.name
      municipalityResults.value = []
      await nextTick()
      isSyncingMunicipalitySearch.value = false
    }
  } finally {
    await nextTick()
    isSyncingForm.value = false
  }
}

const handleSubmit = () => {
  const result = parseCompanyForm(form, {
    isNaturalPerson: isNaturalPerson.value,
    isJuridicaPerson: isJuridicaPerson.value,
    mode: props.mode,
  })

  if (!result.success) {
    Object.assign(errors, result.errors)
    return
  }

  Object.assign(errors, emptyCompanyFormErrors())
  emit('submit', result.data)
}

onMounted(async () => {
  await catalogStore.preload()

  if (!isEditMode.value) {
    await ensureUsersLoaded()
  }
})

defineExpose({
  submit: handleSubmit,
  reset,
  setValues,
})
</script>
