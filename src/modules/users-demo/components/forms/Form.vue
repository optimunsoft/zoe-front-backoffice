<template>
  <form class="space-y-5" novalidate autocomplete="off" @submit.prevent="handleSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <InputText
        id="users-demo-first-name"
        :model-value="form.firstName"
        name="firstName"
        type="text"
        label="Nombre"
        placeholder="Nombre"
        required
        :error="errors.firstName"
        @update:model-value="onFirstNameChange"
        @blur="validateField('firstName')"
      />

      <InputText
        id="users-demo-last-name"
        :model-value="form.lastName"
        name="lastName"
        type="text"
        label="Apellido"
        placeholder="Apellido"
        required
        :error="errors.lastName"
        @update:model-value="onLastNameChange"
        @blur="validateField('lastName')"
      />

      <InputText
        id="users-demo-email"
        v-model="form.email"
        name="email"
        type="email"
        label="Correo electrónico"
        placeholder="correo@empresa.com"
        required
        :error="errors.email"
        @update:model-value="clearFieldError('email')"
        @blur="validateField('email')"
      />

      <div>
        <Datepicker
          id="users-demo-birth-date"
          v-model="form.birthDate"
          label="Fecha de nacimiento"
          mode="single"
          full-width
          year-month-dropdowns
          required
        />
        <p v-if="errors.birthDate" class="mt-1 text-xs text-red-500">
          {{ errors.birthDate }}
        </p>
      </div>

      <InputMunicipalitySearch
        id="users-demo-municipality-search"
        ref="municipalityFieldRef"
        v-model="form.municipalityId"
        required
        :error="errors.municipalityId"
        @update:model-value="clearFieldError('municipalityId')"
      />

      <div>
        <InputField
          label="Celular"
          html-for="users-demo-phone-number"
          required
          :error="phoneFieldError"
        >
          <div class="flex items-start gap-2">
            <div class="w-[6.25rem] shrink-0">
              <InputSelect
                id="users-demo-phone-prefix"
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
                id="users-demo-phone-number"
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

      <div
        v-if="editingUserId"
        class="flex min-h-[3.75rem] items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5 dark:border-gray-700/60"
      >
        <label
          class="text-sm font-medium text-gray-800 dark:text-gray-100"
          for="users-demo-is-active"
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
            id="users-demo-is-active"
            :model-value="userIsActive"
            label="Usuario activo"
            :show-state-label="false"
            on-label="Activo"
            off-label="Inactivo"
            wrapper-class="shrink-0"
            :disabled="isUpdatingUserStatus"
            @update:model-value="onUserStatusToggle"
          />
        </div>
      </div>
    </div>
  </form>

  <ModalAction
    id="confirm-users-demo-status-modal"
    :modal-open="statusModalOpen"
    @close-modal="cancelUserStatusChange"
  >
    <div class="text-center">
      <div
        class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full"
        :class="pendingUserStatus
          ? 'bg-violet-100 dark:bg-violet-500/20'
          : 'bg-amber-100 dark:bg-amber-500/20'"
      >
        <svg
          class="size-6 fill-current"
          :class="pendingUserStatus ? 'text-violet-500' : 'text-amber-500'"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path
            v-if="pendingUserStatus"
            d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.7 5.3l-4.2 4.2c-.2.2-.5.2-.7 0L4.3 7.8c-.2-.2-.2-.5 0-.7l.7-.7c.2-.2.5-.2.7 0l1.8 1.8 3.5-3.5c.2-.2.5-.2.7 0l.7.7c.2.2.2.5 0 .7z"
          />
          <path
            v-else
            d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 11H7V7h2v4zm0-6H7V3h2v2z"
          />
        </svg>
      </div>

      <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
        {{ pendingUserStatus ? '¿Activar usuario demo?' : '¿Desactivar usuario demo?' }}
      </h3>

      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {{
          pendingUserStatus
            ? 'El usuario quedará activo y podrá usar el sistema.'
            : 'El usuario quedará inactivo y no podrá acceder al sistema.'
        }}
      </p>

      <div class="flex justify-center gap-2">
        <Button
          variant="secondary"
          :disabled="isUpdatingUserStatus"
          @click="cancelUserStatusChange"
        >
          Cancelar
        </Button>
        <Button
          :variant="pendingUserStatus ? 'primary' : 'danger'"
          :loading="isUpdatingUserStatus"
          @click="confirmUserStatusChange"
        >
          {{ pendingUserStatus ? 'Activar' : 'Desactivar' }}
        </Button>
      </div>
    </div>
  </ModalAction>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'

import Datepicker from '~/core/ui/form/Datepicker.vue'
import { Button } from '~/core/ui/buttons'
import InputField from '~/core/ui/inputs/InputField.vue'
import InputMunicipalitySearch from '~/core/ui/inputs/InputMunicipalitySearch.vue'
import InputSelect from '~/core/ui/inputs/InputSelect.vue'
import InputSwitch from '~/core/ui/inputs/InputSwitch.vue'
import InputText from '~/core/ui/inputs/InputText.vue'
import type { InputSelectOption } from '~/core/ui/inputs/input.types'
import { Spinner } from '~/core/ui/loader'
import { ModalAction } from '~/core/ui/modal'
import { useUbicationStore } from '~/core/ubication/store/ubication.store'
import {
  formatPhonePrefixLabel,
  normalizePhonePrefixDigits,
  resolveDefaultPhonePrefix,
} from '~/core/ubication/utils/phone.utils'
import { useUsersStore } from '~/modules/administration/users/store/users.store'
import type { User, UserUpdate } from '~/modules/administration/users/types/users.types'
import {
  emptyUsersDemoFormErrors,
  emptyUsersDemoFormValues,
  mapUserToUsersDemoFormValues,
  parseUsersDemoUpdateForm,
  sanitizeUsersDemoName,
  sanitizeUsersDemoPhoneNumber,
  validateUsersDemoForm,
} from '../../schema/users-demo.schema'
import type { UsersDemoFormErrors } from '../../types/users-demo.types'

const props = defineProps<{
  initialUser?: User | null
}>()

const emit = defineEmits<{
  submit: [payload: UserUpdate]
  refresh: []
  'status-updated': [active: boolean]
}>()

const ubicationStore = useUbicationStore()
const usersStore = useUsersStore()

const form = reactive(emptyUsersDemoFormValues())
const errors = reactive<UsersDemoFormErrors>(emptyUsersDemoFormErrors())
const municipalityFieldRef = ref<InstanceType<typeof InputMunicipalitySearch> | null>(null)
const editingUserId = ref<string | null>(null)
const userIsActive = ref(true)
const isUpdatingUserStatus = ref(false)
const statusModalOpen = ref(false)
const pendingUserStatus = ref<boolean | null>(null)

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

const clearFieldError = (field: keyof UsersDemoFormErrors) => {
  errors[field] = ''
}

const validateField = (field: keyof UsersDemoFormErrors) => {
  const fieldErrors = validateUsersDemoForm({ ...form })
  errors[field] = fieldErrors[field]
}

const onFirstNameChange = (value: string) => {
  form.firstName = sanitizeUsersDemoName(value)
  errors.firstName = ''
}

const onLastNameChange = (value: string) => {
  form.lastName = sanitizeUsersDemoName(value)
  errors.lastName = ''
}

const onPhoneNumberChange = (value: string) => {
  form.phoneNumber = sanitizeUsersDemoPhoneNumber(value)
  errors.phoneNumber = ''
}

const resetStatusModal = () => {
  statusModalOpen.value = false
  pendingUserStatus.value = null
}

const reset = () => {
  Object.assign(form, emptyUsersDemoFormValues())
  if (ubicationStore.allCountries.length) {
    form.phonePrefix = resolveDefaultPhonePrefix(ubicationStore.allCountries)
  }
  Object.assign(errors, emptyUsersDemoFormErrors())
  editingUserId.value = null
  userIsActive.value = true
  isUpdatingUserStatus.value = false
  resetStatusModal()
  municipalityFieldRef.value?.reset()
}

const setValues = async (user: User) => {
  editingUserId.value = user.id
  userIsActive.value = user.isActive
  resetStatusModal()

  if (!ubicationStore.allCountries.length) {
    await ubicationStore.getAllCountries()
  }

  Object.assign(form, mapUserToUsersDemoFormValues(user, ubicationStore.allCountries))
  Object.assign(errors, emptyUsersDemoFormErrors())

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

const onUserStatusToggle = (active: boolean) => {
  if (!editingUserId.value || userIsActive.value === active || isUpdatingUserStatus.value) return

  pendingUserStatus.value = active
  statusModalOpen.value = true
}

const cancelUserStatusChange = () => {
  if (isUpdatingUserStatus.value) return
  resetStatusModal()
}

const confirmUserStatusChange = async () => {
  if (
    !editingUserId.value
    || pendingUserStatus.value === null
    || isUpdatingUserStatus.value
  ) {
    return
  }

  const nextStatus = pendingUserStatus.value
  const previousValue = userIsActive.value

  isUpdatingUserStatus.value = true

  try {
    await usersStore.changesStatusUser(editingUserId.value, nextStatus)
    userIsActive.value = nextStatus
    emit('status-updated', nextStatus)
    emit('refresh')
    resetStatusModal()
  } catch {
    userIsActive.value = previousValue
  } finally {
    isUpdatingUserStatus.value = false
  }
}

const handleSubmit = () => {
  const result = parseUsersDemoUpdateForm({ ...form })

  if (!result.success) {
    Object.assign(errors, result.errors)
    return
  }

  Object.assign(errors, emptyUsersDemoFormErrors())
  emit('submit', result.data)
}

watch(
  () => form.birthDate,
  () => {
    errors.birthDate = ''
  },
)

watch(
  () => props.initialUser,
  async (user) => {
    if (!user) return
    await setValues(user)
  },
  { immediate: true },
)

onMounted(async () => {
  await ubicationStore.getAllCountries()
})

defineExpose({
  submit: handleSubmit,
  reset,
  setValues,
})
</script>
