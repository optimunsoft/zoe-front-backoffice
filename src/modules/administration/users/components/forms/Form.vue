<template>
  <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <InputText
        id="user-first-name"
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
        id="user-last-name"
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
        v-if="isEditMode"
        id="user-username"
        :model-value="form.username"
        name="username"
        type="text"
        label="Nombre de usuario"
        placeholder="usuario"
        disabled
        hint="No se puede modificar después de crear el usuario."
        :error="errors.username"
      />

      <InputText
        id="user-email"
        v-model="form.email"
        name="email"
        type="email"
        label="Correo electrónico"
        placeholder="correo@empresa.com"
        required
        :error="errors.email"
        @update:model-value="errors.email = ''"
        @blur="validateField('email')"
      />

      <div>
        <Datepicker
          id="user-birth-date"
          v-model="form.birthDate"
          label="Fecha de nacimiento"
          mode="single"
          full-width
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
        required
        :error="errors.municipalityId"
        @update:model-value="errors.municipalityId = ''"
      />

      <InputSelect
        id="user-phone-prefix"
        v-model="form.phonePrefix"
        name="phonePrefix"
        label="Prefijo telefónico"
        placeholder="Seleccionar"
        required
        :options="phonePrefixOptions"
        :error="errors.phonePrefix"
        @update:model-value="errors.phonePrefix = ''"
      />

      <InputText
        id="user-phone-number"
        :model-value="form.phoneNumber"
        name="phoneNumber"
        type="tel"
        label="Teléfono"
        placeholder="3000000000"
        required
        input-class="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        :error="errors.phoneNumber"
        @update:model-value="onPhoneNumberChange"
        @blur="validateField('phoneNumber')"
      />

      <InputSelect
        id="user-type"
        v-model="form.userType"
        name="userType"
        label="Tipo de usuario"
        disabled
        :options="userTypeOptions"
        :error="errors.userType"
        hint="Tipo fijo para usuarios."
      />

      <InputText
        id="user-password"
        v-model="form.password"
        name="password"
        type="password"
        label="Contraseña"
        :placeholder="isEditMode ? 'Sin cambios' : 'Mínimo 8 caracteres'"
        :required="isCreateMode"
        :hint="isEditMode ? 'Deja en blanco para mantener la contraseña actual.' : undefined"
        :error="errors.password"
        @update:model-value="errors.password = ''"
        @blur="validateField('password')"
      />
    </div>

    <section class="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700/60">
      <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
        Permisos
      </h3>

      <div class="grid gap-4 sm:grid-cols-2">
        <InputField label="Verificado" html-for="user-is-verified">
          <InputSwitch
            id="user-is-verified"
            v-model="form.isVerified"
            on-label="Sí"
            off-label="No"
          />
        </InputField>

        <InputField
          label="Usuario BackOffice"
          html-for="user-is-admin"
        >
          <InputSwitch
            id="user-is-admin"
            v-model="form.isAdmin"
            on-label="Sí"
            off-label="No"
          />
        </InputField>

        <InputSelect
          v-if="form.isAdmin"
          id="user-backoffice-role"
          v-model="form.backofficeRole"
          name="backofficeRole"
          label="Rol de backoffice"
          placeholder="Seleccionar"
          required
          :options="backofficeRoleOptions"
          :error="errors.backofficeRole"
          @update:model-value="errors.backofficeRole = ''"
        />
      </div>
    </section>
  </form>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

import { useUbicationStore } from '~/core/ubication/store/ubication.store'
import Datepicker from '~/core/ui/form/Datepicker.vue'
import InputField from '~/core/ui/inputs/InputField.vue'
import InputMunicipalitySearch from '~/core/ui/inputs/InputMunicipalitySearch.vue'
import InputSelect from '~/core/ui/inputs/InputSelect.vue'
import InputSwitch from '~/core/ui/inputs/InputSwitch.vue'
import InputText from '~/core/ui/inputs/InputText.vue'
import type { InputSelectOption } from '~/core/ui/inputs/input.types'
import { BACKOFFICE_ROLE, USER_TYPE, type User, type UserCreate, type UserUpdate } from '../../types/users.types'
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
}>(), {
  mode: 'create',
})

const isEditMode = computed(() => props.mode === 'edit')
const isCreateMode = computed(() => props.mode === 'create')

const emit = defineEmits<{
  submit: [payload: UserCreate | UserUpdate]
}>()

const ubicationStore = useUbicationStore()

const form = reactive(emptyUserFormValues())
const errors = reactive<UserFormErrors>(emptyUserFormErrors())
const municipalityFieldRef = ref<InstanceType<typeof InputMunicipalitySearch> | null>(null)

const userTypeOptions: InputSelectOption[] = [
  { label: 'Usuario (Root)', value: USER_TYPE.USUARIO },
]

const backofficeRoleOptions: InputSelectOption[] = [
  { label: 'Operario', value: BACKOFFICE_ROLE.OPERARIO },
  { label: 'Administrador', value: BACKOFFICE_ROLE.ADMINISTRADOR },
]

const phonePrefixOptions = computed<InputSelectOption[]>(() =>
  ubicationStore.allCountries.map((country) => ({
    label: `${country.name} (+${country.phonePrefix})`,
    value: country.phonePrefix,
  })),
)

const applyFieldErrors = (fieldErrors: UserFormErrors) => {
  Object.assign(errors, fieldErrors)
}

const validateField = (field: keyof UserFormErrors) => {
  const fieldErrors = validateUserForm({ ...form }, props.mode)
  errors[field] = fieldErrors[field]
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

const reset = () => {
  Object.assign(form, emptyUserFormValues())
  form.userType = USER_TYPE.USUARIO
  Object.assign(errors, emptyUserFormErrors())
  municipalityFieldRef.value?.reset()
}

const setValues = async (user: User) => {
  Object.assign(form, mapUserListToFormValues(user))
  Object.assign(errors, emptyUserFormErrors())
}

const handleSubmit = () => {
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

onMounted(async () => {
  await ubicationStore.getAllCountries()
})

defineExpose({
  submit: handleSubmit,
  reset,
  setValues,
})
</script>
