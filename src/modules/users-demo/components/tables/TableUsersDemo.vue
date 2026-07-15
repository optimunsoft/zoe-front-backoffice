<template>
  <div class="w-full">
    <div class="mb-8 flex flex-col gap-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Usuarios Demo
        </h1>
      </div>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <FilterPills
          v-model="statusFilter"
          :options="statusFilterOptions"
          aria-label="Filtrar usuarios demo por estado"
          wrapper-class="mb-0"
        />

        <div class="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <div class="w-full sm:w-64">
            <InputSearch
              v-model="searchQuery"
              placeholder="Buscar por Nombre..."
              search-label="Buscar"
            />
          </div>
          <ReloadButton :loading="isLoading" @click="handleReload" />
        </div>
      </div>
    </div>

    <TableInitialLoader
      v-if="showInitialLoader"
      message="Cargando usuarios de demo..."
    />

    <UTable
      v-else
      title="Todos los usuarios demo"
      :count="tableRows.length"
      :columns="usersDemoColumns"
      :rows="tableRows"
      :refreshing="isTableRefreshing"
      show-actions
      actions-mode="inline"
      actions-label="Acciones"
      :action-buttons="usersDemoTableActions"
      empty-text="No hay usuarios demo registrados"
      @action="handleRowAction"
    >
      <template #cell-phone="{ row }">
        <UBadge
          v-if="hasPhoneNumber(row.phone)"
          tag="button"
          type="button"
          :color="isPhoneCopied(row.id) ? 'success' : 'primary'"
          appearance="soft"
          size="md"
          :badge-class="[
            'cursor-pointer transition-colors',
            isPhoneAnimating(row.id) ? 'phone-copy-pop' : '',
          ].join(' ')"
          :aria-label="isPhoneCopied(row.id) ? 'Teléfono copiado' : `Copiar teléfono ${row.phone}`"
          @click.stop="copyPhoneNumber(String(row.phone), row.id)"
        >
          <UiIcon
            :name="isPhoneCopied(row.id) ? 'check' : 'copy'"
            size="sm"
            class="shrink-0"
          />
          {{ isPhoneCopied(row.id) ? 'Copiado' : row.phone }}
        </UBadge>
        <UBadge
          v-else
          color="neutral"
          size="md"
        >
          {{ formatTableText('No Aplica') }}
        </UBadge>
      </template>
    </UTable>

    <div class="mt-4" :class="{ 'pointer-events-none opacity-60': isLoading }">
      <PaginationClassic
        :page="currentPage"
        :amount="amount"
        :total="usersStore.total"
        @change-page="handleChangePage"
        @change-amount="handleChangeAmount"
      />
    </div>

    <ModalEdit
      :modal-open="editModalOpen"
      :user="editingUser"
      @close-modal="closeEditModal"
      @updated="handleUsersMutated"
    />

    <ModalDelete
      :modal-open="deleteModalOpen"
      :user-id="selectedDeleteId"
      :user-name="selectedDeleteName"
      @close-modal="closeDeleteModal"
      @deleted="handleDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

import { UBadge } from '~/core/ui/badge'
import { ReloadButton } from '~/core/ui/buttons'
import { FilterPills } from '~/core/ui/filters'
import type { FilterPillOption } from '~/core/ui/filters/filter-pills.types'
import { UiIcon } from '~/core/ui/icons'
import InputSearch from '~/core/ui/inputs/InputSearch.vue'
import PaginationClassic from '~/core/ui/pagination/PaginationClassic.vue'
import { UTable, TableInitialLoader } from '~/core/ui/Tables'
import type { UTableRow } from '~/core/ui/Tables/utable.types'
import { formatTableText } from '~/shared/utils/format'
import { useCopyPhoneNumber } from '~/shared/composables/use-copy-phone-number'
import { useTableRefresh } from '~/shared/composables/use-table-refresh'
import { useUsersStore } from '~/modules/administration/users/store/users.store'
import type { User } from '~/modules/administration/users/types/users.types'
import { usersDemoTableActions } from '../../mappers/users-demo-table.actions'
import {
  mapUsersDemoToTableRows,
  usersDemoColumns,
} from '../../mappers/users-demo-table.mapper'
import ModalDelete from '../modals/ModalDelete.vue'
import ModalEdit from '../modals/ModalEdit.vue'

const usersStore = useUsersStore()
const { isPhoneAnimating, isPhoneCopied, copyPhoneNumber } = useCopyPhoneNumber()
const searchQuery = ref('')
const debouncedSearch = refDebounced(searchQuery, 400)
const currentPage = ref(1)
const amount = ref(10)
const statusFilter = ref('all')

const editModalOpen = ref(false)
const deleteModalOpen = ref(false)
const editingUser = ref<User | null>(null)
const selectedDeleteId = ref<string | null>(null)
const selectedDeleteName = ref('')
const isInitialLoadDone = ref(false)

const {
  isLoading,
  isTableRefreshing,
  showInitialLoader,
  withTableLoading,
} = useTableRefresh()

const statusFilterOptions = computed<FilterPillOption[]>(() => [
  { key: 'all', label: 'Todos', count: statusFilter.value === 'all' ? usersStore.total : undefined },
  { key: 'active', label: 'Activos', count: statusFilter.value === 'active' ? usersStore.total : undefined },
  { key: 'inactive', label: 'Inactivos', count: statusFilter.value === 'inactive' ? usersStore.total : undefined },
])

const tableRows = computed(() => mapUsersDemoToTableRows(usersStore.users))

const resolveIsActiveFilter = (): boolean | undefined => {
  if (statusFilter.value === 'active') return true
  if (statusFilter.value === 'inactive') return false
  return undefined
}

const hasPhoneNumber = (value: unknown) => {
  if (typeof value !== 'string') return false
  const phone = value.trim()
  return phone.length > 0 && phone !== '-'
}

const resolveUserFromRow = (row: UTableRow): User | null => {
  if (row.id == null) return null
  return usersStore.users.find((item) => item.id === String(row.id)) ?? null
}

const fetchUsers = async (page: number) => {
  currentPage.value = page

  await withTableLoading(async () => {
    await usersStore.getUsers({
      amount: amount.value,
      page,
      search: debouncedSearch.value || undefined,
      isDemo: true,
      isActive: resolveIsActiveFilter(),
    })
  })
}

const handleReload = async () => {
  if (isLoading.value) return
  await fetchUsers(currentPage.value)
}

const handleChangePage = async (page: number) => {
  if (isLoading.value || page === currentPage.value) return
  await fetchUsers(page)
}

const handleChangeAmount = async (nextAmount: number) => {
  if (isLoading.value || nextAmount === amount.value) return
  amount.value = nextAmount
  await fetchUsers(1)
}

const handleUsersMutated = async () => {
  await fetchUsers(currentPage.value)
}

const openEditModal = async (row: UTableRow) => {
  const user = resolveUserFromRow(row)
  if (!user) return

  editingUser.value = user
  await nextTick()
  editModalOpen.value = true
}

const closeEditModal = () => {
  editModalOpen.value = false
  editingUser.value = null
}

const openDeleteModal = async (row: UTableRow) => {
  if (row.id == null) return

  selectedDeleteId.value = String(row.id)
  selectedDeleteName.value = String(row.fullName ?? '')
  await nextTick()
  deleteModalOpen.value = true
}

const closeDeleteModal = () => {
  deleteModalOpen.value = false
  selectedDeleteId.value = null
  selectedDeleteName.value = ''
}

const handleDeleted = async () => {
  const isLastItemOnPage = usersStore.users.length === 1
  const shouldGoToPreviousPage = isLastItemOnPage && currentPage.value > 1
  const nextPage = shouldGoToPreviousPage
    ? currentPage.value - 1
    : currentPage.value

  await fetchUsers(nextPage)
}

const handleRowAction = async ({ action, row }: { action: string, row: UTableRow }) => {
  if (action === 'edit') {
    await openEditModal(row)
    return
  }

  if (action === 'delete') {
    await openDeleteModal(row)
  }
}

watch(debouncedSearch, async () => {
  if (!isInitialLoadDone.value) return
  await fetchUsers(1)
})

watch(statusFilter, async () => {
  if (!isInitialLoadDone.value) return
  await fetchUsers(1)
})

onMounted(async () => {
  await fetchUsers(currentPage.value)
  isInitialLoadDone.value = true
})
</script>
