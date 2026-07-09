<template>
  <div class="px-4 sm:px-6 lg:px-8 pt-12 pb-8 w-full max-w-[96rem] mx-auto">
    <div class="mb-8 flex flex-col gap-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Usuarios
        </h1>

        <Button
          class="w-full sm:w-auto"
          variant="primary"
          aria-controls="new-user-modal"
          @click="handleCreateUser"
        >
          <template #icon>
            <UiIcon name="plus" size="sm" />
          </template>
          Nuevo usuario
        </Button>
      </div>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <FilterPills
          v-model="userFilter"
          :options="userFilterOptions"
          aria-label="Filtrar usuarios"
          wrapper-class="mb-0"
        />

        <div class="flex w-full flex-wrap items-center justify-start sm:w-auto sm:justify-end gap-2 sm:gap-3">
          <div class="w-full sm:w-64">
            <InputSearch
              v-model="searchQuery"
              placeholder="Buscar..."
              search-label="Buscar"
            />
          </div>

          <TableColumnToggle
            v-model="visibleColumnKeys"
            :columns="userColumns"
            align="right"
            @reset="resetVisibleColumns"
          />

          <ReloadButton :loading="isLoading" @click="handleReload" />
        </div>
      </div>
    </div>

    <UTable
      title="Todos los usuarios"
      :count="users.length"
      :columns="visibleColumns"
      :rows="users"
      show-actions
      actions-mode="inline"
      actions-label="Acciones"
      :action-buttons="userTableActions"
      @action="handleRowAction"
    >
      <template #cell-email="{ row }">
        <span v-if="hasUserEmail(row.email)" class="text-gray-800 dark:text-gray-100">
          {{ row.email }}
        </span>
        <TableBadge v-else color="neutral">
          No Aplica
        </TableBadge>
      </template>

      <template #cell-isAdmin="{ row }">
        <TableBadge v-if="row.isAdminUser" color="primary">
          Superusuario
        </TableBadge>
        <TableBadge v-else color="neutral">
          No Aplica
        </TableBadge>
      </template>
    </UTable>

    <div class="mt-8">
      <PaginationClassic
        :page="currentPage"
        :amount="amount"
        :total="usersStore.total as number"
        @change-page="handleChangePage"
      />
    </div>

    <ModalCreate
      :modal-open="createModalOpen"
      @close-modal="closeCreateModal"
    />

    <ModalEdit
      :modal-open="editModalOpen"
      :user="editingUser"
      @close-modal="closeEditModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'

import { Button, ReloadButton } from '~/core/ui/buttons'
import { UiIcon } from '~/core/ui/icons'
import { TableBadge } from '~/core/ui/badge'
import TableColumnToggle from '~/core/ui/dropdown/TableColumnToggle.vue'
import { FilterPills } from '~/core/ui/filters'
import InputSearch from '~/core/ui/inputs/InputSearch.vue'
import PaginationClassic from '~/core/ui/pagination/PaginationClassic.vue'
import UTable from '~/core/ui/Tables/Utable.vue'
import type { UTableRow } from '~/core/ui/Tables/utable.types'
import { mapUsersToTableRows, userColumns } from '~/modules/administration/users/mappers/user-tables-mappers'
import { userTableActions } from '~/modules/administration/users/mappers/user-table.actions'
import ModalCreate from '~/modules/administration/users/components/modals/ModalCreate.vue'
import ModalEdit from '~/modules/administration/users/components/modals/ModalEdit.vue'
import { useUsersStore } from '~/modules/administration/users/store/users.store'
import type { User } from '~/modules/administration/users/types/users.types'
import { useVisibleTableColumns } from '~/shared/composables/use-visible-table-columns'
import { buildFilterPillOptions, filterItemsByPill } from '~/shared/utils/build-filter-pill-options'
import { filterTableRows } from '~/shared/utils/filter-table-rows'

const usersStore = useUsersStore()
const selectedItems = ref<Array<string | number>>([])
const searchQuery = ref('')
const userFilter = ref('all')
const currentPage = ref(1)
const amount = ref(10)
const isLoading = ref(false)
const createModalOpen = ref(false)
const editModalOpen = ref(false)
const editingUser = ref<User | null>(null)

const {
  visibleKeys: visibleColumnKeys,
  visibleColumns,
  resetVisibleColumns,
} = useVisibleTableColumns(userColumns, { storageKey: 'table-columns:users' })

const userFilterOptions = computed(() =>
  buildFilterPillOptions<User>({
    items: usersStore.users,
    options: [
      { key: 'all', label: 'Todos' },
      { key: 'active', label: 'Activos', match: (user) => user.isActive },
      { key: 'inactive', label: 'Inactivos', match: (user) => !user.isActive },
      { key: 'verified', label: 'Verificados', match: (user) => user.isVerified },
      { key: 'unverified', label: 'No verificados', match: (user) => !user.isVerified },
      { key: 'admin', label: 'Superusuarios', match: (user) => user.isAdmin },
    ],
  }),
)

const users = computed(() => {
  const byFilter = filterItemsByPill(
    usersStore.users,
    userFilter.value,
    'all',
    {
      active: (user) => user.isActive,
      inactive: (user) => !user.isActive,
      verified: (user) => user.isVerified,
      unverified: (user) => !user.isVerified,
      admin: (user) => user.isAdmin,
    },
  )

  return filterTableRows(
    mapUsersToTableRows(byFilter),
    searchQuery.value,
  )
})

const resolveUserFromRow = (row: UTableRow): User | null => {
  const rowId = row.id == null ? '' : String(row.id).trim()
  if (!rowId) return null

  return usersStore.users.find((user) => user.id === rowId) ?? null
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

const handleRowAction = async ({ action, row }: { action: string, row: UTableRow }) => {
  if (row.id == null) return

  if (action === 'edit') {
    await openEditModal(row)
  }
}

const hasUserEmail = (value: unknown) => {
  if (typeof value !== 'string') return false
  const email = value.trim()
  return email.length > 0 && email !== '-'
}

const fetchUsers = async (page: number, force = false) => {
  isLoading.value = true
  currentPage.value = page

  try {
    await usersStore.getUsers({
      amount: amount.value,
      page,
    }, force)
    selectedItems.value = []
  } finally {
    isLoading.value = false
  }
}

const handleCreateUser = () => {
  createModalOpen.value = true
}

const closeCreateModal = () => {
  createModalOpen.value = false
}

const handleChangePage = async (page: number) => {
  if (isLoading.value || page === currentPage.value) return
  await fetchUsers(page)
}

const handleReload = async () => {
  if (isLoading.value) return
  await fetchUsers(currentPage.value, true)
}

onMounted(() => {
  fetchUsers(currentPage.value)
})
</script>
