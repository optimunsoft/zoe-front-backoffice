<template>
  <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
    <UTabs
      v-model="activeFormTab"
      variant="folder"
      :items="formTabs"
      :keep-alive-panels="true"
      aria-label="Secciones del formulario de usuario"
      :wrapper-class="isCreateMode ? 'mb-2 user-form-tabs--single' : 'mb-2'"
    >
      <template #user-data>
        <div class="grid gap-4 sm:grid-cols-2">
          <InputText
            id="user-first-name"
            :model-value="form.firstName"
            name="firstName"
            type="text"
            :label="firstNameLabel"
            placeholder="Nombre"
            required
            :error="errors.firstName"
            @update:model-value="onFirstNameChange"
            @blur="validateField('firstName')"
          />

          <InputText
            id="user-last-name"
            :model-value="form.lastName"
            name="lastName"
            type="text"
            :label="lastNameLabel"
            placeholder="Apellido"
            required
            :error="errors.lastName"
            @update:model-value="onLastNameChange"
            @blur="validateField('lastName')"
          />

          <InputText
            id="user-email"
            v-model="form.email"
            name="email"
            type="email"
            :label="emailLabel"
            placeholder="correo@empresa.com"
            required
            :error="errors.email"
            @update:model-value="clearFieldError('email')"
            @blur="validateField('email')"
          />

          <div>
            <Datepicker
              id="user-birth-date"
              v-model="form.birthDate"
              label="Fecha de nacimiento"
              mode="single"
              full-width
              year-month-dropdowns
              required
            />
            <p v-if="errors.birthDate" class="text-xs mt-1 text-red-500">
              {{ errors.birthDate }}
            </p>
          </div>

          <InputMunicipalitySearch
            id="user-municipality-search"
            ref="municipalityFieldRef"
            v-model="form.municipalityId"
            :label="municipalityLabel"
            required
            :error="errors.municipalityId"
            @update:model-value="clearFieldError('municipalityId')"
          />

          <div>
            <InputField
              :label="phoneLabel"
              html-for="user-phone-number"
              required
              :error="phoneFieldError"
            >
              <div class="flex items-start gap-2">
                <div class="w-[6.25rem] shrink-0">
                  <InputSelect
                    id="user-phone-prefix"
                    v-model="form.phonePrefix"
                    name="phonePrefix"
                    placeholder="Prefijo"
                    required
                    compact-selected
                    teleport-dropdown
                    :options="phonePrefixOptions"
                    select-class="!pr-8"
                    @update:model-value="clearFieldError('phonePrefix')"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <InputText
                    id="user-phone-number"
                    :model-value="form.phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="3000000000"
                    required
                    digits-only
                    :max-length="15"
                    @update:model-value="onPhoneNumberChange"
                    @blur="validateField('phoneNumber')"
                  />
                </div>
              </div>
            </InputField>
          </div>



          <div v-if="isCreateMode">
            <InputText
              id="user-password"
              v-model="form.password"
              name="password"
              type="password"
              label="Contraseña"
              placeholder="Ingresa una contraseña segura"
              required
              :error="errors.password"
              @update:model-value="clearFieldError('password')"
              @blur="validateField('password')"
            />

            <PasswordRequirements
              v-if="showPasswordRequirements"
              :password="form.password"
              class="mt-3"
            />
          </div>
        </div>
      </template>

      <template #configuration>
        <section class="space-y-6">
          <div
            v-if="isEditMode && editingUserId"
            class="space-y-3"
          >
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400">
              General
            </h3>

            <div class="flex flex-col gap-2">
              <div class="flex min-h-[3.75rem] items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5 dark:border-gray-700/60">
                <label
                  class="text-sm font-medium text-gray-800 dark:text-gray-100"
                  for="user-is-active"
                >
                  Usuario activo
                </label>
                <div class="flex shrink-0 items-center gap-2">
                  <Spinner
                    v-if="isUpdatingUserStatus"
                    size="md"
                    class="text-violet-500 dark:text-violet-300"
                  />
                  <InputSwitch
                    id="user-is-active"
                    :model-value="userIsActive"
                    label="Usuario activo"
                    :show-state-label="false"
                    on-label="Activo"
                    off-label="Inactivo"
                    wrapper-class="shrink-0"
                    :disabled="isUpdatingUserStatus"
                    @update:model-value="onUserStatusChange"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="showBackofficeSection"
            class="space-y-3"
          >
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Backoffice
            </h3>

            <div
              class="flex flex-col gap-2"
              :class="{ 'opacity-60': !canEditModulesAndBackoffice }"
            >
              <div class="flex min-h-[3.75rem] items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5 dark:border-gray-700/60">
                <label
                  class="text-sm font-medium text-gray-800 dark:text-gray-100"
                  for="user-is-admin"
                >
                  Usuario BackOffice
                </label>
                <InputSwitch
                  id="user-is-admin"
                  v-model="form.isAdmin"
                  label="Usuario BackOffice"
                  :show-state-label="false"
                  on-label="Sí"
                  off-label="No"
                  wrapper-class="shrink-0"
                  :disabled="!canEditModulesAndBackoffice"
                />
              </div>

              <InputSelect
                v-if="form.isAdmin"
                id="user-backoffice-role"
                v-model="form.backofficeRole"
                name="backofficeRole"
                label="Rol de backoffice"
                placeholder="Seleccionar"
                required
                :disabled="!canEditModulesAndBackoffice"
                :options="backofficeRoleOptions"
                :error="errors.backofficeRole"
                @update:model-value="clearFieldError('backofficeRole')"
              />
            </div>
          </div>
        </section>
      </template>
    </UTabs>
  </form>
</template>

<style scoped>
/* wrapper-class vive en el root de UTabs (hijo); hace falta :deep en el selector */
:deep(.user-form-tabs--single) {
  display: none;
}

:deep(.user-form-tabs--single + div) {
  margin-top: 0;
}
</style>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'

import { useUbicationStore } from '~/core/ubication/store/ubication.store'
import {
  formatPhonePrefixLabel,
  normalizePhonePrefixDigits,
  resolveDefaultPhonePrefix,
} from '~/core/ubication/utils/phone.utils'
import { arePasswordRequirementsComplete } from '~/shared/utils/password.utils'
import Datepicker from '~/core/ui/form/Datepicker.vue'
import InputField from '~/core/ui/inputs/InputField.vue'
import InputMunicipalitySearch from '~/core/ui/inputs/InputMunicipalitySearch.vue'
import PasswordRequirements from '~/core/ui/inputs/PasswordRequirements.vue'
import InputSelect from '~/core/ui/inputs/InputSelect.vue'
import InputSwitch from '~/core/ui/inputs/InputSwitch.vue'
import InputText from '~/core/ui/inputs/InputText.vue'
import { UTabs } from '~/core/ui/tabs'
import type { UiTabItem } from '~/core/ui/tabs'
import type { InputSelectOption } from '~/core/ui/inputs/input.types'
import { Spinner } from '~/core/ui/loader'
import { BACKOFFICE_ROLE, type User, type UserCreate, type UserUpdate } from '../../types/users.types'
import { useUsersStore } from '../../store/users.store'
import {
  emptyUserFormErrors,
  emptyUserFormValues,
  mapUserListToFormValues,
  parseUserCreateForm,
  parseUserUpdateForm,
  sanitizePhoneNumber,
  sanitizeUserName,
  validateUserForm,
  type UserFormErrors,
} from '../../schema/user.schema'

defineOptions({
  name: 'FormUser',
})

const props = withDefaults(defineProps<{
  mode?: 'create' | 'edit'
  initialUser?: User | null
  showBackofficeSection?: boolean
  emailLabel?: string
  firstNameLabel?: string
  lastNameLabel?: string
  municipalityLabel?: string
  phoneLabel?: string
}>(), {
  mode: 'create',
  initialUser: null,
  showBackofficeSection: true,
  emailLabel: 'Correo electrónico',
  firstNameLabel: 'Nombre',
  lastNameLabel: 'Apellido',
  municipalityLabel: 'Municipio',
  phoneLabel: 'Celular',
})

const isEditMode = computed(() => props.mode === 'edit')
const isCreateMode = computed(() => props.mode === 'create')

const emit = defineEmits<{
  submit: [payload: UserCreate | UserUpdate]
  refresh: []
}>()

const ubicationStore = useUbicationStore()
const usersStore = useUsersStore()

const form = reactive(emptyUserFormValues())
const errors = reactive<UserFormErrors>(emptyUserFormErrors())
const municipalityFieldRef = ref<InstanceType<typeof InputMunicipalitySearch> | null>(null)
const activeFormTab = ref('user-data')
const editingUserId = ref<string | null>(null)
const userIsActive = ref(true)
const isUpdatingUserStatus = ref(false)

const formTabs = computed<UiTabItem[]>(() => {
  const tabs: UiTabItem[] = [
    { key: 'user-data', label: 'Datos del usuario' },
  ]

  if (isEditMode.value) {
    tabs.push({ key: 'configuration', label: 'Configuración' })
  }

  return tabs
})

const configurationTabFields: Array<keyof UserFormErrors> = ['backofficeRole']



const backofficeRoleOptions: InputSelectOption[] = [
  { label: 'Operario', value: BACKOFFICE_ROLE.OPERARIO },
  { label: 'Administrador', value: BACKOFFICE_ROLE.ADMINISTRADOR },
]

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

  const currentPrefix = normalizePhonePrefixDigits(form.phonePrefix)
  if (currentPrefix && !seen.has(currentPrefix)) {
    options.unshift({
      label: formatPhonePrefixLabel(currentPrefix),
      selectedLabel: formatPhonePrefixLabel(currentPrefix),
      value: currentPrefix,
    })
  }

  return options
})

const phoneFieldError = computed(() => errors.phonePrefix || errors.phoneNumber)

const showPasswordRequirements = computed(() => {
  if (errors.password) return true
  if (!form.password.length) return false

  return !arePasswordRequirementsComplete(form.password)
})

const canEditModulesAndBackoffice = computed(() => {
  if (isCreateMode.value) return true

  return userIsActive.value
})

const applyFieldErrors = (fieldErrors: UserFormErrors) => {
  Object.assign(errors, fieldErrors)
  focusTabWithErrors(fieldErrors)
}

const focusTabWithErrors = (fieldErrors: UserFormErrors) => {
  const hasConfigurationError = isEditMode.value
    && configurationTabFields.some((field) => fieldErrors[field])
  const hasUserDataError = (Object.keys(fieldErrors) as Array<keyof UserFormErrors>)
    .some((field) => fieldErrors[field] && !configurationTabFields.includes(field))

  if (hasConfigurationError) {
    activeFormTab.value = 'configuration'
    return
  }

  if (hasUserDataError) {
    activeFormTab.value = 'user-data'
  }
}

const validateField = (field: keyof UserFormErrors) => {
  const fieldErrors = validateUserForm({ ...form }, props.mode)
  errors[field] = fieldErrors[field]
}

const clearFieldError = (field: keyof UserFormErrors) => {
  errors[field] = ''
}

const onFirstNameChange = (value: string) => {
  form.firstName = sanitizeUserName(value)
  errors.firstName = ''
}

const onLastNameChange = (value: string) => {
  form.lastName = sanitizeUserName(value)
  errors.lastName = ''
}

const onPhoneNumberChange = (value: string) => {
  form.phoneNumber = sanitizePhoneNumber(value)
  errors.phoneNumber = ''
}

const refreshUsersList = () => {
  emit('refresh')
}

const onUserStatusChange = async (active: boolean) => {
  if (!editingUserId.value || userIsActive.value === active || isUpdatingUserStatus.value) return

  const previousValue = userIsActive.value
  userIsActive.value = active
  isUpdatingUserStatus.value = true

  try {
    await usersStore.changesStatusUser(editingUserId.value!, active)
    await refreshUsersList()
  } catch {
    userIsActive.value = previousValue
  } finally {
    isUpdatingUserStatus.value = false
  }
}

const reset = () => {
  Object.assign(form, emptyUserFormValues())

  if (!props.showBackofficeSection) {
    form.isAdmin = false
    form.backofficeRole = ''
  }

  if (isCreateMode.value && ubicationStore.allCountries.length) {
    form.phonePrefix = resolveDefaultPhonePrefix(ubicationStore.allCountries)
  }

  Object.assign(errors, emptyUserFormErrors())
  activeFormTab.value = 'user-data'
  editingUserId.value = null
  userIsActive.value = true
  isUpdatingUserStatus.value = false
  municipalityFieldRef.value?.reset()
}

const setValues = async (user: User) => {
  editingUserId.value = user.id
  userIsActive.value = user.isActive

  if (!ubicationStore.allCountries.length) {
    await ubicationStore.getAllCountries()
  }

  Object.assign(form, mapUserListToFormValues(user, ubicationStore.allCountries))
  if (!props.showBackofficeSection) {
    form.isAdmin = false
    form.backofficeRole = ''
  }
  Object.assign(errors, emptyUserFormErrors())
  activeFormTab.value = 'user-data'

  await nextTick()

  const municipalityId = user.municipalityId?.trim()
  if (!municipalityId) {
    municipalityFieldRef.value?.reset()
    return
  }

  if (user.municipality?.id) {
    await municipalityFieldRef.value?.setMunicipality(user.municipality)
    return
  }

  const municipality = await ubicationStore.getMunicipalityById(municipalityId)
  if (municipality) {
    await municipalityFieldRef.value?.setMunicipality(municipality)
  }
}

watch(
  () => props.initialUser,
  async (user) => {
    if (!isEditMode.value || !user) return
    await setValues(user)
  },
  { immediate: true },
)

const handleSubmit = () => {
  if (!props.showBackofficeSection) {
    form.isAdmin = false
    form.backofficeRole = ''
  }

  if (isEditMode.value) {
    const result = parseUserUpdateForm({ ...form })

    if (!result.success) {
      applyFieldErrors(result.errors)
      return
    }

    Object.assign(errors, emptyUserFormErrors())
    emit('submit', result.data)
    return
  }

  const result = parseUserCreateForm({ ...form })

  if (!result.success) {
    applyFieldErrors(result.errors)
    return
  }

  Object.assign(errors, emptyUserFormErrors())
  emit('submit', result.data)
}

watch(
  () => form.birthDate,
  () => {
    errors.birthDate = ''
  },
)

watch(
  () => form.isAdmin,
  (isAdmin) => {
    if (isAdmin) return

    form.backofficeRole = ''
    errors.backofficeRole = ''
  },
)

watch(
  () => userIsActive.value,
  (isActive) => {
    if (isActive || !isEditMode.value) return

    errors.backofficeRole = ''
  },
)

onMounted(async () => {
  await ubicationStore.getAllCountries()

  if (isCreateMode.value) {
    form.phonePrefix = resolveDefaultPhonePrefix(ubicationStore.allCountries)
  }
})

defineExpose({
  submit: handleSubmit,
  reset,
  setValues,
})
</script>

