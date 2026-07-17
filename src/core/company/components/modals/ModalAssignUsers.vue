<template>
  <ModalBasic
    id="company-assign-users-modal"
    :modal-open="modalOpen"
    :title="modalTitle"
    description="Asigna o quita usuarios administrador de la empresa."
    size="2xl"
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
        <UiIcon name="users" size="md" class="text-violet-500" />
      </div>
    </template>
    <div class="space-y-4">
      <p class="text-[14px] font-medium text-gray-500 dark:text-gray-400">
        Buscar usuario
      </p>

      <div ref="adminAnchorRef" class="relative w-full">

        <input
          id="company-assign-user-search"
          v-model="adminUserSearch"
          type="text"
          name="adminUserSearch"
          placeholder="Agregar usuario"
          class="form-input min-h-10 w-full pr-10"
          :disabled="isBusy"
          @input="onAdminUserSearchInput"
          @focus="onAdminUserSearchFocus"
          @blur="onAdminUserSearchBlur"
        >
        <button
          type="button"
          class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 transition hover:text-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          :aria-label="assignAdminActionLabel"
          :disabled="isBusy"
          @mousedown.prevent
          @click="confirmAddAdminUser"
        >
          <Spinner v-if="isBusy" size="sm" />
          <UiIcon v-else name="plus" size="sm" />
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
            :disabled="isBusy"
            @mousedown.prevent="selectAdminUserCandidate(user)"
          >
            <span
              class="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-semibold text-violet-600 dark:bg-violet-500/20 dark:text-violet-300"
            >
              {{ getUserInitials(user) }}
            </span>
            <div class="min-w-0 flex-1">
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
        class="flex max-h-64 flex-col gap-2 overflow-y-auto pe-1"
      >
        <div
          v-for="user in selectedAdminUsers"
          :key="user.id"
          class="flex items-center justify-between gap-3 rounded-lg bg-sky-50 px-3 py-2.5 dark:bg-sky-500/10"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span
              class="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-sky-700 shadow-sm dark:bg-sky-500/20 dark:text-sky-300"
            >
              {{ getUserInitials(user) }}
            </span>
            <div class="min-w-0">
              <div class="flex min-w-0 flex-wrap items-center gap-2">
                <p class="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                  {{ formatUserDisplayName(user) }}
                </p>
                <TableBadge
                  v-if="user.isOwner"
                  color="warning"
                  badge-class="shrink-0"
                >
                  Dueño
                </TableBadge>
              </div>
              <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                {{ user.email }}
              </p>
            </div>
          </div>
          <span
            v-if="pendingAdminUserId === user.id"
            class="inline-flex size-8 shrink-0 items-center justify-center text-sky-600 dark:text-sky-300"
          >
            <Spinner size="md" />
          </span>
          <button
            v-else
            type="button"
            class="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-white/70 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-sky-500/20 dark:hover:text-gray-200"
            aria-label="Quitar usuario administrador"
            :disabled="isBusy"
            @click="requestRemoveAdminUser(user.id)"
          >
            <UiIcon name="close" size="sm" />
          </button>
        </div>
      </div>

      <p
        v-else
        class="w-full rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-sm text-gray-500 dark:border-gray-700/60 dark:text-gray-400"
      >
        No hay usuarios administrador asignados.
      </p>
    </div>

    <template #footer>
      <Button variant="secondary" :disabled="isBusy" @click="handleClose">
        Cerrar
      </Button>
    </template>
  </ModalBasic>

  <ModalAction
    id="confirm-assign-admin-user-modal"
    :modal-open="assignAdminModalOpen"
    @close-modal="cancelAssignAdminUser"
  >
    <div class="text-center">
      <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/20">
        <UiIcon name="users" size="md" class="text-violet-500" />
      </div>

      <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
        ¿Asignar usuario?
      </h3>

      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <template v-if="pendingAssignAdminUser">
          Se asignará a
          <span class="font-medium text-gray-700 dark:text-gray-200">
            {{ formatUserDisplayName(pendingAssignAdminUser) }}
          </span>
          como dueño de esta empresa.
        </template>
        <template v-else>
          Se asignará el usuario como dueño de esta empresa.
        </template>
      </p>

      <div class="flex justify-center gap-2">
        <Button variant="secondary" :disabled="isBusy" @click="cancelAssignAdminUser">
          Cancelar
        </Button>
        <Button variant="primary" :loading="isBusy" @click="confirmAssignAdminUser">
          Asignar
        </Button>
      </div>
    </div>
  </ModalAction>

  <ModalAction
    id="confirm-remove-assigned-admin-user-modal"
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
        <Button variant="secondary" :disabled="isBusy" @click="cancelRemoveAdminUser">
          Cancelar
        </Button>
        <Button variant="danger" :loading="isBusy" @click="confirmRemoveAdminUser">
          Quitar
        </Button>
      </div>
    </div>
  </ModalAction>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

import { useUsersService } from '~/modules/administration/users/services/users.services'
import type { PaginatedUsersResponse, User } from '~/modules/administration/users/types/users.types'
import { USER_TYPE } from '~/modules/administration/users/types/users.types'
import { TableBadge } from '~/core/ui/badge'
import { Button } from '~/core/ui/buttons'
import { ModalAction, ModalBasic } from '~/core/ui/modal'
import { Spinner } from '~/core/ui/loader'
import { UiIcon } from '~/core/ui/icons'
import type { userCompany } from '../../types/company.types'
import { getCompanyAdministratorUsers } from '../../mappers/company-users.mapper'
import { useAnchoredOverlay } from '../../composables/use-anchored-overlay'
import { useCompanyStore } from '../../store/company.store'

defineOptions({
  name: 'ModalAssignUsers',
})

const props = defineProps<{
  modalOpen: boolean
  companyId: string
  companyName: string
}>()

const emit = defineEmits<{
  'close-modal': []
  updated: []
}>()

const usersService = useUsersService()
const companyStore = useCompanyStore()

const selectedAdminUserIds = ref<string[]>([])
const assignedUsersById = ref<Record<string, DisplayUser>>({})
const adminUserCandidates = ref<User[]>([])
const adminUserSearch = ref('')
const showAdminSuggestions = ref(false)
const isSearchingAdminUsers = ref(false)
const pendingAdminUserId = ref<string | null>(null)
const hasChanges = ref(false)

/** Toda asignación en este modal se envía siempre como dueño. */
const ASSIGN_AS_OWNER = true as const

const isBusy = computed(() => pendingAdminUserId.value !== null)

const removeAdminModalOpen = ref(false)
const pendingRemoveAdminUserId = ref<string | null>(null)
const pendingRemoveAdminUserName = ref('')

const assignAdminModalOpen = ref(false)
const pendingAssignAdminUser = ref<User | null>(null)

const modalTitle = computed(() => {
  const name = props.companyName.trim()
  return name ? `Asignar usuarios - ${name}` : 'Asignar usuarios administrador'
})

const assignAdminActionLabel = 'Agregar usuario'

type AdminUserCandidate = Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>

type DisplayUser = AdminUserCandidate & {
  isOwner: boolean
}

const formatUserDisplayName = (user: AdminUserCandidate) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return fullName || user.email
}

const getUserInitials = (user: AdminUserCandidate) => {
  const first = user.firstName?.trim()?.[0]
  const last = user.lastName?.trim()?.[0]
  if (first || last) return `${first ?? ''}${last ?? ''}`.toUpperCase()
  return (user.email?.trim()?.[0] ?? '?').toUpperCase()
}

const userToDisplay = (user: User | userCompany, isOwner = false): DisplayUser => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  isOwner: 'isOwner' in user ? Boolean(user.isOwner) : isOwner,
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
      isDemo: false,
      search: search.trim() || undefined,
    })

    adminUserCandidates.value = normalizeUsersResponse(response).filter(
      (user) => user.isDemo !== true,
    )
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

const runAdminUserSearch = useDebounceFn(async (term: string) => {
  await fetchAdminUserCandidates(term)
}, 300)

const onAdminUserSearchInput = () => {
  showAdminSuggestions.value = true
  void runAdminUserSearch(adminUserSearch.value)
}

const onAdminUserSearchFocus = () => {
  showAdminSuggestions.value = true
  void runAdminUserSearch(adminUserSearch.value)
}

const onAdminUserSearchBlur = () => {
  window.setTimeout(() => {
    showAdminSuggestions.value = false
  }, 150)
}

const assignAdminUser = async (user: User) => {
  if (selectedAdminUserIds.value.includes(user.id) || isBusy.value) return

  const displayUser = userToDisplay(user, ASSIGN_AS_OWNER)
  const previousIds = [...selectedAdminUserIds.value]
  const previousUsers = { ...assignedUsersById.value }
  selectedAdminUserIds.value = [...selectedAdminUserIds.value, user.id]
  assignedUsersById.value = {
    ...assignedUsersById.value,
    [user.id]: displayUser,
  }
  pendingAdminUserId.value = user.id

  try {
    await companyStore.assignUsersToCompany(props.companyId, [user.id], ASSIGN_AS_OWNER)
    hasChanges.value = true
  } catch {
    selectedAdminUserIds.value = previousIds
    assignedUsersById.value = previousUsers
  } finally {
    pendingAdminUserId.value = null
  }
}

const requestAssignAdminUser = (user: User) => {
  if (selectedAdminUserIds.value.includes(user.id) || isBusy.value) return

  adminUserSearch.value = ''
  showAdminSuggestions.value = false
  pendingAssignAdminUser.value = user
  assignAdminModalOpen.value = true
}

const cancelAssignAdminUser = () => {
  if (isBusy.value) return

  assignAdminModalOpen.value = false
  pendingAssignAdminUser.value = null
}

const confirmAssignAdminUser = async () => {
  if (isBusy.value || !pendingAssignAdminUser.value) return

  const user = pendingAssignAdminUser.value
  assignAdminModalOpen.value = false
  pendingAssignAdminUser.value = null

  await assignAdminUser(user)
}

const selectAdminUserCandidate = (user: User) => {
  requestAssignAdminUser(user)
}

const confirmAddAdminUser = () => {
  const term = adminUserSearch.value.trim().toLowerCase()
  const exactMatch = filteredAdminUsers.value.find((user) => {
    const name = formatUserDisplayName(user).toLowerCase()
    return name === term || user.email.toLowerCase() === term
  })

  if (exactMatch) {
    requestAssignAdminUser(exactMatch)
    return
  }

  showAdminSuggestions.value = true
  void runAdminUserSearch(adminUserSearch.value)
}

const requestRemoveAdminUser = (userId: string) => {
  if (isBusy.value) return

  const user = assignedUsersById.value[userId]
  pendingRemoveAdminUserId.value = userId
  pendingRemoveAdminUserName.value = user ? formatUserDisplayName(user) : ''
  removeAdminModalOpen.value = true
}

const cancelRemoveAdminUser = () => {
  if (isBusy.value) return

  removeAdminModalOpen.value = false
  pendingRemoveAdminUserId.value = null
  pendingRemoveAdminUserName.value = ''
}

const confirmRemoveAdminUser = async () => {
  if (isBusy.value || !pendingRemoveAdminUserId.value) return

  const userId = pendingRemoveAdminUserId.value
  removeAdminModalOpen.value = false
  pendingRemoveAdminUserId.value = null
  pendingRemoveAdminUserName.value = ''

  await removeAdminUser(userId)
}

const removeAdminUser = async (userId: string) => {
  if (isBusy.value) return

  pendingAdminUserId.value = userId

  try {
    await companyStore.unassignUsersFromCompany(props.companyId, userId)
    selectedAdminUserIds.value = selectedAdminUserIds.value.filter((id) => id !== userId)
    const { [userId]: _removed, ...rest } = assignedUsersById.value
    assignedUsersById.value = rest
    hasChanges.value = true
  } catch {
    // El cliente API muestra la notificación de error; se mantiene el usuario en la lista.
  } finally {
    pendingAdminUserId.value = null
  }
}

const syncAdminUserAssignments = (users: userCompany[]) => {
  assignedUsersById.value = Object.fromEntries(
    users.map((user) => [user.id, userToDisplay(user)]),
  )
  selectedAdminUserIds.value = users.map((user) => user.id)
  adminUserSearch.value = ''
  showAdminSuggestions.value = false
  adminUserCandidates.value = []
}

const loadCompanyAdminUsers = () => {
  const company = companyStore.getCompanyFromList(props.companyId)
  syncAdminUserAssignments(getCompanyAdministratorUsers(company?.users))
}

watch(
  () => [props.modalOpen, props.companyId] as const,
  ([isOpen, companyId]) => {
    if (!isOpen || !companyId) return

    hasChanges.value = false
    loadCompanyAdminUsers()
  },
  { immediate: true },
)

const handleClose = () => {
  if (isBusy.value) return

  if (hasChanges.value) {
    emit('updated')
    hasChanges.value = false
  }

  emit('close-modal')
}
</script>
