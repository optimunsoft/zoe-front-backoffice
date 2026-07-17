<template>
  <ModalBasic
    id="user-sessions-modal"
    :modal-open="modalOpen"
    :title="modalTitle"
    :description="modalDescription"
    size="5xl"
    :loading="isLoading"
    loading-text="Cargando sesiones..."
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
        <UiIcon name="history" size="md" class="text-violet-500" />
      </div>
    </template>

    <div v-if="user" class="space-y-4">
      <FilterPills
        v-model="statusFilter"
        :options="statusFilterOptions"
        :show-count="false"
        aria-label="Filtrar sesiones por estado"
        :wrapper-class="isLoading ? 'mb-0 pointer-events-none opacity-60' : 'mb-0'"
      />

      <UTable
        v-if="!isLoading"
        title="Historial de sesiones"
        :count="sessionRows.length"
        :columns="userSessionTableColumns"
        :rows="sessionRows"
        :visible-rows="0"
        body-max-height="20rem"
        empty-text="Este usuario no tiene sesiones registradas."
      >
        <template #cell-loginAt="{ row }">
          <span class="font-medium text-gray-800 dark:text-gray-100">
            {{ formatTableText(row.loginAt) }}
          </span>
        </template>

        <template #cell-ip="{ row }">
          <span class="font-medium tabular-nums text-gray-800 dark:text-gray-100">
            {{ row.ip }}
          </span>
        </template>

        <template #cell-logoutAt="{ row }">
          <TableBadge
            v-if="row.logoutAt === '-'"
            color="neutral"
          >
            {{ formatTableText('No Aplica') }}
          </TableBadge>
          <span
            v-else
            class="text-gray-800 dark:text-gray-100"
          >
            {{ formatTableText(row.logoutAt) }}
          </span>
        </template>

        <template
          v-for="columnKey in sessionEmptyValueColumns"
          :key="columnKey"
          #[`cell-${columnKey}`]="{ row }"
        >
          <TableBadge
            v-if="row[columnKey] === '-'"
            color="neutral"
          >
            {{ formatTableText('No Aplica') }}
          </TableBadge>
          <span
            v-else
            class="text-gray-800 dark:text-gray-100"
          >
            {{ formatTableText(row[columnKey]) }}
          </span>
        </template>
      </UTable>
    </div>

    <template #footer>
      <Button variant="secondary" :disabled="isLoading" @click="handleClose">
        Cerrar
      </Button>
    </template>
  </ModalBasic>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { Button } from '~/core/ui/buttons'
import { TableBadge } from '~/core/ui/badge'
import { FilterPills, type FilterPillOption } from '~/core/ui/filters'
import { UiIcon } from '~/core/ui/icons'
import { ModalBasic } from '~/core/ui/modal'
import UTable from '~/core/ui/Tables/Utable.vue'
import { formatTableText } from '~/shared/utils/format'
import {
  mapUserSessionsToTableRows,
  userSessionTableColumns,
} from '~/modules/administration/users/mappers/user-sessions.mapper'
import { useUsersStore } from '~/modules/administration/users/store/users.store'
import type { SessionUser, User } from '~/modules/administration/users/types/users.types'

const sessionEmptyValueColumns = [
  'device',
  'browser',
  'operatingSystem',
  'location',
] as const

const statusFilterOptions: FilterPillOption[] = [
  { key: 'all', label: 'Todas' },
  { key: 'active', label: 'Activas' },
  { key: 'inactive', label: 'Inactivas' },
]

const props = defineProps<{
  modalOpen: boolean
  user: User | null
}>()

const emit = defineEmits<{
  'close-modal': []
}>()

const usersStore = useUsersStore()
const sessions = ref<SessionUser[]>([])
const isLoading = ref(false)
const statusFilter = ref('all')

const sessionRows = computed(() => mapUserSessionsToTableRows(sessions.value))

const userDisplayName = computed(() => {
  if (!props.user) return ''

  const fullName = [props.user.firstName, props.user.lastName].filter(Boolean).join(' ')
  return fullName || props.user.email
})

const modalTitle = computed(() => {
  const name = userDisplayName.value.trim()
  if (!name) return 'Sesiones de usuario'
  return `Sesiones de usuario - ${name}`
})

const modalDescription = computed(() => {
  const email = props.user?.email?.trim()
  if (!email) return 'Consulta el historial de accesos del usuario.'
  return email
})

const resolveIsActiveFilter = (): boolean | undefined => {
  if (statusFilter.value === 'active') return true
  if (statusFilter.value === 'inactive') return false
  return undefined
}

const loadSessions = async (userId: string) => {
  isLoading.value = true
  sessions.value = []

  try {
    sessions.value = await usersStore.sessionUser(userId, resolveIsActiveFilter())
  } catch {
    sessions.value = []
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.modalOpen,
  (isOpen) => {
    if (isOpen) return
    sessions.value = []
    isLoading.value = false
    statusFilter.value = 'all'
  },
)

watch(
  () => [props.modalOpen, props.user?.id, statusFilter.value] as const,
  ([isOpen, userId]) => {
    if (!isOpen || !userId) return
    void loadSessions(userId)
  },
)

const handleClose = () => {
  if (isLoading.value) return
  emit('close-modal')
}
</script>
