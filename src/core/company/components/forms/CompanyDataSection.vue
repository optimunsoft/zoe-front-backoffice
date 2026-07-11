<template>
  <div
    class="company-data-form"
    :class="{ 'company-data-form--single-column': !isEditMode }"
  >
    <aside v-if="isEditMode" class="company-data-form__sidebar">
      <InputFileUpload
        id="company-photo"
        v-model="companyPhoto"
        :remote-preview-url="companyLogoUrl"
        label="Logo"
        :accept="photoAccept"
        :max-size-mb="5"
        help-text="PNG o JPEG, máximo 5 MB"
        :disabled="isUploadingLogo"
        :loading="isUploadingLogo"
        :error="logoError"
        @update:model-value="onCompanyPhotoSelected"
        @clear="onCompanyLogoClear"
      />
    </aside>

    <div class="company-data-form__fields">
      <div class="company-data-form__row">
        <div class="company-data-form__col">
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

        <div class="company-data-form__col">
          <div class="grid grid-cols-[minmax(0,1fr)_4.5rem] gap-2">
            <InputText
              id="company-document-number"
              :model-value="form.documentNumber"
              name="documentNumber"
              label="NIT"
              placeholder="900123456"
              required
              digits-only
              :max-length="15"
              :error="errors.documentNumber"
              @update:model-value="onDocumentNumberChange"
            />
            <InputText
              id="company-verification-digit"
              :model-value="form.verificationDigit"
              name="verificationDigit"
              label="DV"
              placeholder="--"
              disabled
              digits-only
              :max-length="1"
              input-class="text-center"
              :error="errors.verificationDigit"
            />
          </div>
        </div>
      </div>

      <div class="company-data-form__row">
        <div class="company-data-form__col">
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

        <div class="company-data-form__col">
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
      </div>

      <div class="company-data-form__row">
        <div class="company-data-form__col">
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

        <div class="company-data-form__col">
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

      <template v-if="isNaturalPerson">
        <div class="company-data-form__row">
          <div class="company-data-form__col">
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
          </div>

          <div class="company-data-form__col">
            <InputText
              id="company-middle-name"
              :model-value="form.middleName"
              name="middleName"
              label="Segundo nombre"
              placeholder="Segundo nombre"
              :error="errors.middleName"
              @update:model-value="onMiddleNameChange"
            />
          </div>
        </div>

        <div class="company-data-form__row">
          <div class="company-data-form__col">
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

          <div class="company-data-form__col">
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
        </div>
      </template>

      <div class="company-data-form__row">
        <div class="company-data-form__col">
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

        <div class="company-data-form__col">
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
      </div>

      <div class="company-data-form__row">
        <div class="company-data-form__col">
          <InputMunicipalitySearch
            id="company-municipality-search"
            ref="municipalityFieldRef"
            v-model="form.municipalityId"
            required
            :error="errors.municipalityId"
            @update:model-value="errors.municipalityId = ''"
          />
        </div>

        <div class="company-data-form__col">
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
      </div>

      <div class="company-data-form__row">
        <div class="company-data-form__col">
          <InputText
            id="company-professional-card"
            :model-value="form.professionalCardNumber"
            name="professionalCardNumber"
            label="N° Tarjeta profesional"
            placeholder="N° Tarjeta profesional"
            digits-only
            :max-length="30"
            :error="errors.professionalCardNumber"
            @update:model-value="onProfessionalCardNumberChange"
          />
        </div>
      </div>


    </div>
  </div>

  <div class="mt-3 space-y-3">
    <div v-if="!isEditMode">
      <template v-if="!selectedOwner">
        <InputField
          label="Dueño de la empresa"
          html-for="company-owner-search"
          required
          :error="errors.ownerUserId"
        >
          <div class="flex items-center gap-2">
            <div ref="ownerAnchorRef" class="relative min-w-0 flex-1">
              <input
                id="company-owner-search"
                v-model="ownerSearch"
                type="text"
                name="ownerSearch"
                placeholder="Buscar usuario por nombre o correo..."
                class="form-input w-full"
                @input="onOwnerSearchInput(($event.target as HTMLInputElement).value)"
              >
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

          <Teleport to="body">
            <div
              v-if="showOwnerSuggestions && ownerPanelStyle"
              class="fixed max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700/60 dark:bg-gray-800"
              :style="ownerPanelStyle"
            >
              <button
                v-for="user in ownerSearchResults"
                :key="user.id"
                type="button"
                class="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-800/60"
                :class="pendingOwner?.id === user.id ? 'bg-violet-50 dark:bg-violet-500/10' : ''"
                @mousedown.prevent="selectOwnerCandidate(user)"
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
          </Teleport>
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
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

import { useUsersStore } from '~/modules/administration/users/store/users.store'
import type { User } from '~/modules/administration/users/types/users.types'
import InputSelect from '~/core/ui/inputs/InputSelect.vue'
import InputFileUpload from '~/core/ui/inputs/InputFileUpload.vue'
import InputText from '~/core/ui/inputs/InputText.vue'
import InputField from '~/core/ui/inputs/InputField.vue'
import InputMunicipalitySearch from '~/core/ui/inputs/InputMunicipalitySearch.vue'
import { Button } from '~/core/ui/buttons'
import { UiIcon } from '~/core/ui/icons'
import type { InputSelectOption } from '~/core/ui/inputs/input.types'
import type { Company } from '../../types/company.types'
import {
  sanitizeCompanyDocumentNumber,
  sanitizeCompanyName,
  sanitizeCompanyProfessionalCardNumber,
  type CompanyFormErrors,
  type CompanyFormValues,
} from '../../schema/company.schema'
import { useAnchoredOverlay } from '../../composables/use-anchored-overlay'
import { useCompanyStore } from '../../store/company.store'
defineOptions({
  name: 'CompanyDataSection',
})

const form = defineModel<CompanyFormValues>('form', { required: true })
const errors = defineModel<CompanyFormErrors>('errors', { required: true })

const props = defineProps<{
  mode: 'create' | 'edit'
  companyId?: string | null
  isNaturalPerson: boolean
  isJuridicaPerson: boolean
  isSyncingForm: boolean
  documentTypeOptions: InputSelectOption[]
  vatRegimeOptions: InputSelectOption[]
  taxResponsibilityOptions: InputSelectOption[]
  businessNatureOptions: InputSelectOption[]
}>()

const isEditMode = computed(() => props.mode === 'edit')

type CompanyOwnerSelection = Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>

const usersStore = useUsersStore()
const companyStore = useCompanyStore()

const municipalityFieldRef = ref<InstanceType<typeof InputMunicipalitySearch> | null>(null)

const photoAccept = '.png,.jpg,.jpeg,image/png,image/jpeg'
const companyPhoto = ref<File | null>(null)
const companyLogoUrl = ref('')
const isUploadingLogo = ref(false)
const logoError = ref('')

const ownerSearch = ref('')
const ownerSearchDebounced = refDebounced(ownerSearch, 300)
const ownerSearchResults = ref<User[]>([])
const pendingOwner = ref<CompanyOwnerSelection | null>(null)
const selectedOwner = ref<CompanyOwnerSelection | null>(null)
const isSearchingOwners = ref(false)
const isSyncingOwnerSearch = ref(false)

const resetCompanyLogo = () => {
  companyPhoto.value = null
  companyLogoUrl.value = ''
  logoError.value = ''
  isUploadingLogo.value = false
}

const resolveCompanyLogoUrl = (logo: string) => {
  const value = logo.trim()
  if (!value) return ''

  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value
  }

  const config = useRuntimeConfig()
  const basePath = (config.public.API_BACKOFFICE_PATH || '/proxy/api-backoffice').replace(/\/$/, '')
  return `${basePath}/${value.replace(/^\//, '')}`
}

const loadCompanyLogo = async (companyId: string) => {
  try {
    const logo = await companyStore.getCompanyLogo(companyId)
    companyLogoUrl.value = resolveCompanyLogoUrl(logo)
    logoError.value = ''
  } catch {
    companyLogoUrl.value = ''
  }
}

const uploadCompanyLogo = async (
  file: File,
  companyId: string,
  options?: { skipNotification?: boolean },
) => {
  isUploadingLogo.value = true
  logoError.value = ''

  try {
    await companyStore.uploadCompanyLogo(companyId, file, options)
    companyPhoto.value = null
    await loadCompanyLogo(companyId)
    return true
  } catch {
    logoError.value = 'No se pudo subir el logo.'
    companyPhoto.value = null
    return false
  } finally {
    isUploadingLogo.value = false
  }
}

const onCompanyPhotoSelected = async (file: File | null) => {
  if (!file) return

  logoError.value = ''

  if (!props.companyId) return

  await uploadCompanyLogo(file, props.companyId)
}

const onCompanyLogoClear = () => {
  companyPhoto.value = null
  logoError.value = ''
}

const uploadLogoIfNeeded = async (
  companyId: string,
  options?: { skipNotification?: boolean },
) => {
  if (!companyPhoto.value) return true
  return uploadCompanyLogo(companyPhoto.value, companyId, options)
}

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

const {
  anchorRef: ownerAnchorRef,
  panelStyle: ownerPanelStyle,
} = useAnchoredOverlay(showOwnerSuggestions)

const selectOwnerCandidate = async (user: User) => {
  pendingOwner.value = user
  isSyncingOwnerSearch.value = true
  ownerSearch.value = formatUserSearchLabel(user)
  ownerSearchResults.value = []
  await nextTick()
  isSyncingOwnerSearch.value = false
  errors.value.ownerUserId = ''
}

const onOwnerSearchInput = (value: string) => {
  if (isSyncingOwnerSearch.value) return

  pendingOwner.value = null
  errors.value.ownerUserId = ''

  if (!value.trim()) {
    ownerSearchResults.value = []
  }
}

const ensureUsersLoaded = async () => {
  if (usersStore.users.length > 0) return
  await usersStore.getUsers({ page: 1, amount: 100 })
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
    errors.value.ownerUserId = 'Selecciona un usuario de los resultados antes de agregar.'
    return
  }

  selectedOwner.value = pendingOwner.value
  form.value.ownerUserId = pendingOwner.value.id
  errors.value.ownerUserId = ''
  ownerSearch.value = ''
  ownerSearchResults.value = []
  pendingOwner.value = null
}

const removeOwner = () => {
  selectedOwner.value = null
  form.value.ownerUserId = ''
  ownerSearch.value = ''
  ownerSearchResults.value = []
  pendingOwner.value = null
  errors.value.ownerUserId = ''
}

const mapCompanyUserToOwner = (user: Company['users'][number]): CompanyOwnerSelection => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
})

const clearPersonFields = () => {
  form.value.businessName = ''
  form.value.firstName = ''
  form.value.middleName = ''
  form.value.lastName = ''
  form.value.secondLastName = ''
  errors.value.businessName = ''
  errors.value.firstName = ''
  errors.value.middleName = ''
  errors.value.lastName = ''
  errors.value.secondLastName = ''
}

const onBusinessNatureChange = (value: string | number) => {
  if (props.isSyncingForm) return

  form.value.businessNatureId = String(value)
  errors.value.businessNatureId = ''
  clearPersonFields()
}

const onDocumentNumberChange = (value: string) => {
  form.value.documentNumber = sanitizeCompanyDocumentNumber(value)
  errors.value.documentNumber = ''
}

const onFirstNameChange = (value: string) => {
  form.value.firstName = sanitizeCompanyName(value)
  errors.value.firstName = ''
}

const onMiddleNameChange = (value: string) => {
  form.value.middleName = sanitizeCompanyName(value)
  errors.value.middleName = ''
}

const onLastNameChange = (value: string) => {
  form.value.lastName = sanitizeCompanyName(value)
  errors.value.lastName = ''
}

const onSecondLastNameChange = (value: string) => {
  form.value.secondLastName = sanitizeCompanyName(value)
  errors.value.secondLastName = ''
}

const onAccountantNameChange = (value: string) => {
  form.value.accountantName = sanitizeCompanyName(value)
  errors.value.accountantName = ''
}

const onProfessionalCardNumberChange = (value: string) => {
  form.value.professionalCardNumber = sanitizeCompanyProfessionalCardNumber(value)
  errors.value.professionalCardNumber = ''
}

watch(ownerSearchDebounced, async (term) => {
  if (selectedOwner.value || pendingOwner.value) return
  await searchOwners(term)
})

const reset = () => {
  removeOwner()
  municipalityFieldRef.value?.reset()
  resetCompanyLogo()
}

const setFromCompany = async (company: Company, options: { mode: 'create' | 'edit' }) => {
  removeOwner()

  if (options.mode !== 'edit') {
    const owner = company.users?.find((user) => user.isOwner)
    if (owner) {
      selectedOwner.value = mapCompanyUserToOwner(owner)
      form.value.ownerUserId = owner.id
    } else if (form.value.ownerUserId) {
      await ensureUsersLoaded()
      const user = usersStore.users.find((item) => item.id === form.value.ownerUserId)
      if (user) selectedOwner.value = user
    }
  }

  if (company.municipality?.id) {
    await municipalityFieldRef.value?.setMunicipality(company.municipality)
  } else {
    municipalityFieldRef.value?.reset()
  }

  const companyId = props.companyId ?? company.id
  if (companyId && options.mode === 'edit') {
    await loadCompanyLogo(companyId)
  } else {
    resetCompanyLogo()
  }
}

defineExpose({
  reset,
  setFromCompany,
  uploadLogoIfNeeded,
})
</script>

<style scoped>
.company-data-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.company-data-form__sidebar {
  min-width: 0;
}

.company-data-form__sidebar :deep(.flex.flex-col.items-center.justify-center) {
  min-height: 10.5rem;
  padding-block: 1.25rem;
}

.company-data-form__sidebar :deep(.flex.flex-col.items-center.justify-center img) {
  max-height: 6rem;
}

.company-data-form__fields {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}

.company-data-form__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.75rem;
  align-items: start;
}

.company-data-form__col {
  min-width: 0;
}

@media (width >= 640px) {
  .company-data-form__row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 1rem;
    row-gap: 0;
  }

  .company-data-form__row--single {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width >= 1024px) {
  .company-data-form {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(14rem, 1fr);
    column-gap: 1.25rem;
    align-items: start;
  }

  .company-data-form--single-column {
    grid-template-columns: minmax(0, 1fr);
  }

  .company-data-form__sidebar {
    grid-column: 2;
    grid-row: 1;
    position: sticky;
    top: 0;
  }

  .company-data-form__fields {
    grid-column: 1;
    grid-row: 1;
  }
}
</style>
