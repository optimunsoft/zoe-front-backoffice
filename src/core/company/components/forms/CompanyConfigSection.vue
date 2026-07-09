<template>
  <div class="space-y-5">
    <div class="min-w-0">
      <InputField
        label="Activar empresa"
        html-for="company-is-active"
      >
        <InputSwitch
          id="company-is-active"
          :model-value="form.isActive"
          label="Activar empresa"
          on-label="Activa"
          off-label="Inactiva"
          :disabled="isUpdatingCompanyStatus"
          @update:model-value="onCompanyStatusToggle"
        />
      </InputField>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
      <section class="company-config-panel">
        <div class="company-config-panel__header">
          <h4 class="text-sm font-semibold text-gray-400 dark:text-gray-100">
            Usuarios administrador
          </h4>
        </div>

        <div class="company-config-panel__body">
          <div ref="adminAnchorRef" class="company-config-panel__search">
            <input
              id="company-admin-user-search"
              v-model="adminUserSearch"
              type="text"
              name="adminUserSearch"
              placeholder="Agregar usuario"
              class="company-config-panel__search-input form-input w-full pr-10"
              :disabled="isAssigningAdminUser"
              @input="onAdminUserSearchInput"
              @focus="onAdminUserSearchFocus"
              @blur="onAdminUserSearchBlur"
            >
            <button
              type="button"
              class="company-config-panel__search-action"
              aria-label="Agregar usuario administrador"
              :disabled="isAssigningAdminUser"
              @mousedown.prevent
              @click="confirmAddAdminUser"
            >
              <UiIcon name="plus" size="sm" />
            </button>
          </div>

          <Teleport to="body">
            <div
              v-if="showAdminSuggestionsPanel && adminPanelStyle"
              class="fixed max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700/60 dark:bg-gray-800"
              :style="adminPanelStyle"
            >
              <button
                v-for="user in filteredAdminUsers"
                :key="user.id"
                type="button"
                class="flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-800/60"
                @mousedown.prevent="selectAdminUserCandidate(user)"
              >
                <span
                  class="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-semibold text-violet-600 dark:bg-violet-500/20 dark:text-violet-300"
                >
                  {{ getUserInitials(user) }}
                </span>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                    {{ formatUserDisplayName(user) }}
                  </p>
                  <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                    {{ user.email }}
                  </p>
                </div>
              </button>

              <p
                v-if="isSearchingAdminUsers"
                class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
              >
                Buscando...
              </p>

              <p
                v-else-if="filteredAdminUsers.length === 0"
                class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
              >
                No se encontraron usuarios con ese criterio.
              </p>
            </div>
          </Teleport>

          <div
            v-if="selectedAdminUsers.length > 0"
            class="company-config-panel__list"
          >
            <div
              v-for="user in selectedAdminUsers"
              :key="user.id"
              class="company-config-panel__card bg-sky-50 dark:bg-sky-500/10"
            >
              <div class="flex min-w-0 items-center gap-3">
                <span
                  class="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-sky-700 shadow-sm dark:bg-sky-500/20 dark:text-sky-300"
                >
                  {{ getUserInitials(user) }}
                </span>
                <div class="company-config-panel__card-text">
                  <p class="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                    {{ formatUserDisplayName(user) }}
                  </p>
                  <p class="company-config-panel__card-subtitle truncate text-xs text-gray-500 dark:text-gray-400">
                    {{ user.email }}
                  </p>
                </div>
              </div>
              <button
                type="button"
                class="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-white/70 hover:text-gray-600 dark:hover:bg-sky-500/20 dark:hover:text-gray-200"
                aria-label="Quitar usuario administrador"
                :disabled="isAssigningAdminUser"
                @click="requestRemoveAdminUser(user.id)"
              >
                <UiIcon name="close" size="sm" />
              </button>
            </div>
          </div>

          <p
            v-else
            class="company-config-panel__empty"
          >
            No hay usuarios administrador asignados.
          </p>
        </div>
      </section>

      <CompanyModulesSection
        ref="modulesSectionRef"
        class="company-config-panel"
        mode="edit"
        :company-id="companyId"
      />
    </div>
  </div>

  <ModalAction
    id="confirm-company-status-modal"
    :modal-open="companyStatusModalOpen"
    @close-modal="cancelCompanyStatusChange"
  >
    <div class="text-center">
      <div
        class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full"
        :class="pendingCompanyStatus
          ? 'bg-violet-100 dark:bg-violet-500/20'
          : 'bg-amber-100 dark:bg-amber-500/20'"
      >
        <svg
          class="size-6 fill-current"
          :class="pendingCompanyStatus ? 'text-violet-500' : 'text-amber-500'"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path
            v-if="pendingCompanyStatus"
            d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.7 5.3l-4.2 4.2c-.2.2-.5.2-.7 0L4.3 7.8c-.2-.2-.2-.5 0-.7l.7-.7c.2-.2.5-.2.7 0l1.8 1.8 3.5-3.5c.2-.2.5-.2.7 0l.7.7c.2.2.2.5 0 .7z"
          />
          <path
            v-else
            d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 11H7V7h2v4zm0-6H7V3h2v2z"
          />
        </svg>
      </div>

      <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
        {{ pendingCompanyStatus ? '¿Activar empresa?' : '¿Desactivar empresa?' }}
      </h3>

      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {{
          pendingCompanyStatus
            ? 'La empresa quedará activa y disponible en el sistema.'
            : 'La empresa quedará inactiva y no estará disponible para operaciones.'
        }}
      </p>

      <div class="flex justify-center gap-2">
        <Button
          variant="secondary"
          :disabled="isUpdatingCompanyStatus"
          @click="cancelCompanyStatusChange"
        >
          Cancelar
        </Button>
        <Button
          :variant="pendingCompanyStatus ? 'primary' : 'danger'"
          :loading="isUpdatingCompanyStatus"
          @click="confirmCompanyStatusChange"
        >
          {{ pendingCompanyStatus ? 'Activar' : 'Desactivar' }}
        </Button>
      </div>
    </div>
  </ModalAction>

  <ModalAction
    id="confirm-remove-admin-user-modal"
    :modal-open="removeAdminModalOpen"
    @close-modal="cancelRemoveAdminUser"
  >
    <div class="text-center">
      <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
        <svg
          class="size-6 fill-current text-red-500"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 10.1l-1.4 1.4L8 9.4l-2.1 2.1-1.4-1.4L6.6 8 4.5 5.9l1.4-1.4L8 6.6l2.1-2.1 1.4 1.4L9.4 8l2.1 2.1z" />
        </svg>
      </div>

      <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
        ¿Quitar usuario administrador?
      </h3>

      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <template v-if="pendingRemoveAdminUserName">
          Se quitará a
          <span class="font-medium text-gray-700 dark:text-gray-200">{{ pendingRemoveAdminUserName }}</span>
          como administrador de esta empresa.
        </template>
        <template v-else>
          Se quitará el usuario administrador de esta empresa.
        </template>
      </p>

      <div class="flex justify-center gap-2">
        <Button variant="secondary" :disabled="isAssigningAdminUser" @click="cancelRemoveAdminUser">
          Cancelar
        </Button>
        <Button variant="danger" :loading="isAssigningAdminUser" @click="confirmRemoveAdminUser">
          Quitar
        </Button>
      </div>
    </div>
  </ModalAction>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

import { useUsersService } from '~/modules/administration/users/services/users.services'
import type { PaginatedUsersResponse, User } from '~/modules/administration/users/types/users.types'
import { USER_TYPE } from '~/modules/administration/users/types/users.types'
import InputField from '~/core/ui/inputs/InputField.vue'
import InputSwitch from '~/core/ui/inputs/InputSwitch.vue'
import { Button } from '~/core/ui/buttons'
import { ModalAction } from '~/core/ui/modal'
import { UiIcon } from '~/core/ui/icons'
import type { Company, userCompany } from '../../types/company.types'
import type { CompanyFormValues } from '../../schema/company.schema'
import { getCompanyAdministratorUsers } from '../../mappers/company-users.mapper'
import { useAnchoredOverlay } from '../../composables/use-anchored-overlay'
import { useCompanyStore } from '../../store/company.store'
import CompanyModulesSection from './CompanyModulesSection.vue'
import './company-config-panel.css'

defineOptions({
  name: 'CompanyConfigSection',
})

const props = defineProps<{
  form: CompanyFormValues
  isUpdatingCompanyStatus: boolean
  companyId?: string | null
}>()

const emit = defineEmits<{
  'update:isActive': [active: boolean]
}>()

const usersService = useUsersService()
const companyStore = useCompanyStore()

const selectedAdminUserIds = ref<string[]>([])
const assignedUsersById = ref<Record<string, DisplayUser>>({})
const adminUserCandidates = ref<User[]>([])
const adminUserSearch = ref('')
const adminUserSearchDebounced = refDebounced(adminUserSearch, 300)
const showAdminSuggestions = ref(false)
const isSearchingAdminUsers = ref(false)
const isAssigningAdminUser = ref(false)
const modulesSectionRef = ref<InstanceType<typeof CompanyModulesSection> | null>(null)

const companyStatusModalOpen = ref(false)
const pendingCompanyStatus = ref<boolean | null>(null)

const removeAdminModalOpen = ref(false)
const pendingRemoveAdminUserId = ref<string | null>(null)
const pendingRemoveAdminUserName = ref('')

type DisplayUser = Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>

const formatUserDisplayName = (user: DisplayUser) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return fullName || user.email
}

const getUserInitials = (user: DisplayUser) => {
  const first = user.firstName?.trim()?.[0]
  const last = user.lastName?.trim()?.[0]
  if (first || last) return `${first ?? ''}${last ?? ''}`.toUpperCase()
  return (user.email?.trim()?.[0] ?? '?').toUpperCase()
}

const userToDisplay = (user: User | userCompany): DisplayUser => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
})

const selectedAdminUsers = computed(() =>
  selectedAdminUserIds.value
    .map((id) => assignedUsersById.value[id] ?? null)
    .filter((user): user is DisplayUser => Boolean(user)),
)

const normalizeUsersResponse = (response: User[] | PaginatedUsersResponse): User[] => {
  if (Array.isArray(response)) return response
  return response.data ?? response.items ?? response.users ?? []
}

const fetchAdminUserCandidates = async (search = '') => {
  isSearchingAdminUsers.value = true

  try {
    const { response } = await usersService.getUsers({
      page: 1,
      amount: 100,
      type: USER_TYPE.USUARIO,
      search: search.trim() || undefined,
    })

    adminUserCandidates.value = normalizeUsersResponse(response)
  } catch {
    adminUserCandidates.value = []
  } finally {
    isSearchingAdminUsers.value = false
  }
}

const availableAdminUsers = computed(() =>
  adminUserCandidates.value.filter((user) => !selectedAdminUserIds.value.includes(user.id)),
)

const filteredAdminUsers = computed(() => availableAdminUsers.value.slice(0, 20))

const showAdminSuggestionsPanel = computed(() => showAdminSuggestions.value)

const {
  anchorRef: adminAnchorRef,
  panelStyle: adminPanelStyle,
} = useAnchoredOverlay(showAdminSuggestionsPanel)

const onAdminUserSearchInput = () => {
  showAdminSuggestions.value = true
}

const onAdminUserSearchFocus = () => {
  showAdminSuggestions.value = true

  if (adminUserCandidates.value.length === 0) {
    void fetchAdminUserCandidates(adminUserSearch.value)
  }
}

const onAdminUserSearchBlur = () => {
  window.setTimeout(() => {
    showAdminSuggestions.value = false
  }, 150)
}

const onCompanyStatusToggle = (active: boolean) => {
  if (props.isUpdatingCompanyStatus || props.form.isActive === active) return

  pendingCompanyStatus.value = active
  companyStatusModalOpen.value = true
}

const cancelCompanyStatusChange = () => {
  if (props.isUpdatingCompanyStatus) return

  companyStatusModalOpen.value = false
  pendingCompanyStatus.value = null
}

const confirmCompanyStatusChange = () => {
  if (props.isUpdatingCompanyStatus || pendingCompanyStatus.value === null) return

  emit('update:isActive', pendingCompanyStatus.value)
  companyStatusModalOpen.value = false
  pendingCompanyStatus.value = null
}

const assignAdminUser = async (user: User) => {
  if (selectedAdminUserIds.value.includes(user.id) || isAssigningAdminUser.value) return

  if (!props.companyId) {
    selectedAdminUserIds.value = [...selectedAdminUserIds.value, user.id]
    assignedUsersById.value = {
      ...assignedUsersById.value,
      [user.id]: userToDisplay(user),
    }
    return
  }

  const previousIds = [...selectedAdminUserIds.value]
  selectedAdminUserIds.value = [...selectedAdminUserIds.value, user.id]
  assignedUsersById.value = {
    ...assignedUsersById.value,
    [user.id]: userToDisplay(user),
  }
  isAssigningAdminUser.value = true

  try {
    await companyStore.assignUsersToCompany(props.companyId, [user.id], false)
  } catch {
    selectedAdminUserIds.value = previousIds
    const { [user.id]: _removed, ...rest } = assignedUsersById.value
    assignedUsersById.value = rest
  } finally {
    isAssigningAdminUser.value = false
  }
}

const selectAdminUserCandidate = async (user: User) => {
  adminUserSearch.value = ''
  showAdminSuggestions.value = false
  await assignAdminUser(user)
}

const confirmAddAdminUser = async () => {
  const term = adminUserSearch.value.trim().toLowerCase()
  const exactMatch = filteredAdminUsers.value.find((user) => {
    const name = formatUserDisplayName(user).toLowerCase()
    return name === term || user.email.toLowerCase() === term
  })

  if (exactMatch) {
    await selectAdminUserCandidate(exactMatch)
    return
  }

  showAdminSuggestions.value = true
}

const requestRemoveAdminUser = (userId: string) => {
  if (isAssigningAdminUser.value) return

  const user = assignedUsersById.value[userId]
  pendingRemoveAdminUserId.value = userId
  pendingRemoveAdminUserName.value = user ? formatUserDisplayName(user) : ''
  removeAdminModalOpen.value = true
}

const cancelRemoveAdminUser = () => {
  if (isAssigningAdminUser.value) return

  removeAdminModalOpen.value = false
  pendingRemoveAdminUserId.value = null
  pendingRemoveAdminUserName.value = ''
}

const confirmRemoveAdminUser = async () => {
  if (isAssigningAdminUser.value || !pendingRemoveAdminUserId.value) return

  const userId = pendingRemoveAdminUserId.value
  removeAdminModalOpen.value = false
  pendingRemoveAdminUserId.value = null
  pendingRemoveAdminUserName.value = ''

  await removeAdminUser(userId)
}

const removeAdminUser = async (userId: string) => {
  if (isAssigningAdminUser.value) return

  if (!props.companyId) {
    selectedAdminUserIds.value = selectedAdminUserIds.value.filter((id) => id !== userId)
    const { [userId]: _removed, ...rest } = assignedUsersById.value
    assignedUsersById.value = rest
    return
  }

  const previousIds = [...selectedAdminUserIds.value]
  const previousUsers = { ...assignedUsersById.value }
  selectedAdminUserIds.value = selectedAdminUserIds.value.filter((id) => id !== userId)
  const { [userId]: _removed, ...rest } = assignedUsersById.value
  assignedUsersById.value = rest
  isAssigningAdminUser.value = true

  try {
    await companyStore.unassignUsersFromCompany(props.companyId, userId)
  } catch {
    selectedAdminUserIds.value = previousIds
    assignedUsersById.value = previousUsers
  } finally {
    isAssigningAdminUser.value = false
  }
}

const syncAdminUserAssignments = (users: userCompany[]) => {
  assignedUsersById.value = Object.fromEntries(users.map((user) => [user.id, userToDisplay(user)]))
  selectedAdminUserIds.value = users.map((user) => user.id)
  adminUserSearch.value = ''
  showAdminSuggestions.value = false
  adminUserCandidates.value = []
}

watch(adminUserSearchDebounced, async (term) => {
  if (!showAdminSuggestions.value) return
  await fetchAdminUserCandidates(term)
})

const reset = () => {
  selectedAdminUserIds.value = []
  assignedUsersById.value = {}
  adminUserCandidates.value = []
  adminUserSearch.value = ''
  showAdminSuggestions.value = false
  companyStatusModalOpen.value = false
  pendingCompanyStatus.value = null
  removeAdminModalOpen.value = false
  pendingRemoveAdminUserId.value = null
  pendingRemoveAdminUserName.value = ''
  modulesSectionRef.value?.reset()
}

const setFromCompany = async (company: Company) => {
  syncAdminUserAssignments(getCompanyAdministratorUsers(company.users))
  modulesSectionRef.value?.setModules(company.modules ?? [])
}

defineExpose({
  reset,
  setFromCompany,
})
</script>
