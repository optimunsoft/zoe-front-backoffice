<template>
  <div class="px-4 sm:px-6 lg:px-8 pt-12 pb-8 w-full max-w-[96rem] mx-auto">
    <div class="mb-8 flex flex-col gap-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Usuarios
        </h1>

        <Button
          class="w-full sm:w-auto"
          variant="primary"
          aria-controls="create-users-backoffice-modal"
          @click="handleCreateUser"
        >
          <template #icon>
            <UiIcon name="plus" size="sm" />
          </template>
          Nuevo usuario
        </Button>
      </div>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <FilterCards
          v-model="statusFilter"
          :options="statusFilterOptions"
          aria-label="Filtrar usuarios backoffice por estado"
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
      message="Cargando usuarios backoffice..."
    />

    <UTable
      v-else
      title="Usuarios del Back Office"
      :count="tableRows.length"
      :columns="usersBackofficeColumns"
      :rows="tableRows"
      :refreshing="isTableRefreshing"
      show-actions
      actions-mode="inline"
      actions-label="Acciones"
      :expanded-row-key="expandedCompaniesRowKey"
      expanded-action-key="companies"
      empty-text="No hay usuarios backoffice registrados"
      @action="handleRowAction"
    >
      <template #actions="{ row }">
        <div class="flex justify-start space-x-1">
          <Tooltip
            v-for="action in usersBackofficeTableActions"
            :key="action.key"
            bg="light"
            position="top"
          >
            <template #trigger>
              <button
                type="button"
                :class="[
                  UI_TABLE_ICON_BUTTON_CLASSES,
                  isCompaniesActionExpanded(row, action)
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400',
                ]"
                :aria-expanded="isCompaniesActionExpanded(row, action) || undefined"
                :aria-label="action.label"
                @click.stop="handleRowAction({ action: action.key, row })"
              >
                <span class="sr-only">{{ action.label }}</span>
                <UiIcon
                  v-if="action.icon"
                  :name="action.icon"
                  size="lg"
                />
              </button>
            </template>
            <div class="whitespace-nowrap text-xs font-medium">
              {{ action.tooltip || action.label }}
            </div>
          </Tooltip>
        </div>
      </template>

      <template #row-detail="{ row }">
        <TableUserBackofficeCompanies
          v-if="getUserForRow(row)"
          :user="getUserForRow(row)!"
          @unassigned="handleUsersMutated"
        />
      </template>

      <template #header-companiesCount="{ column }">
        <div class="font-semibold text-center">
          {{ column.label }}
        </div>
      </template>

      <template #cell-email="{ row }">
        <span v-if="hasUserEmail(row.email)" class="text-gray-800 dark:text-gray-100">
          {{ formatTableText(row.email) }}
        </span>
        <TableBadge v-else color="neutral">
          {{ formatTableText('No Aplica') }}
        </TableBadge>
      </template>

      <template #cell-companiesCount="{ value }">
        <div class="text-center text-gray-800 dark:text-gray-100 tabular-nums">
          {{ value }}
        </div>
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

    <ModalCreate
      :modal-open="createModalOpen"
      @close-modal="closeCreateModal"
      @created="handleUsersMutated"
    />

    <ModalEdit
      :modal-open="editModalOpen"
      :user="editingUser"
      @close-modal="closeEditModal"
      @updated="handleUsersMutated"
    />

    <ModalAssignCompanies
      :modal-open="assignCompaniesModalOpen"
      :user="assignCompaniesUser"
      @close-modal="closeAssignCompaniesModal"
      @updated="handleUsersMutated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

import { TableBadge } from '~/core/ui/badge'
import { Button, ReloadButton } from '~/core/ui/buttons'
import { FilterCards } from '~/core/ui/filters'
import type { FilterCardOption } from '~/core/ui/filters/filter-cards.types'
import { useUsersService } from '~/modules/administration/users/services/users.services'
import { UiIcon } from '~/core/ui/icons'
import { UI_TABLE_ICON_BUTTON_CLASSES } from '~/core/ui/interactive.classes'
import InputSearch from '~/core/ui/inputs/InputSearch.vue'
import PaginationClassic from '~/core/ui/pagination/PaginationClassic.vue'
import { UTable, TableInitialLoader } from '~/core/ui/Tables'
import type { UTableActionButton, UTableRow } from '~/core/ui/Tables/utable.types'
import { Tooltip } from '~/core/ui/utooltip'
import { useUsersStore } from '~/modules/administration/users/store/users.store'
import type { User } from '~/modules/administration/users/types/users.types'
import { formatTableText } from '~/shared/utils/format'
import { useTableRefresh } from '~/shared/composables/use-table-refresh'
import { usersBackofficeTableActions } from '../../mappers/users-backoffice-table.actions'
import {
  mapUsersBackofficeToTableRows,
  usersBackofficeColumns,
} from '../../mappers/users-backoffice-table.mapper'
import ModalAssignCompanies from '../modals/ModalAssignCompanies.vue'
import ModalCreate from '../modals/ModalCreate.vue'
import ModalEdit from '../modals/ModalEdit.vue'
import TableUserBackofficeCompanies from './TableUserBackofficeCompanies.vue'

const usersStore = useUsersStore()
const usersService = useUsersService()
const searchQuery = ref('')
const debouncedSearch = refDebounced(searchQuery, 400)
const currentPage = ref(1)
const amount = ref(10)
const statusFilter = ref('all')
const filterTotals = ref<Record<string, number>>({})
const isInitialLoadDone = ref(false)

const statusFilterDefinitions = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'inactive', label: 'Inactivos' },
] as const

const createModalOpen = ref(false)
const editModalOpen = ref(false)
const editingUser = ref<User | null>(null)
const assignCompaniesModalOpen = ref(false)
const assignCompaniesUser = ref<User | null>(null)
const expandedCompaniesRowKey = ref<string | number | null>(null)

const {
  isLoading,
  isTableRefreshing,
  showInitialLoader,
  withTableLoading,
} = useTableRefresh()

const statusFilterOptions = computed<FilterCardOption[]>(() =>
  statusFilterDefinitions.map((option) => ({
    key: option.key,
    label: option.label,
    count: filterTotals.value[option.key]
      ?? (statusFilter.value === option.key ? usersStore.total : undefined),
  })),
)

const tableRows = computed(() => mapUsersBackofficeToTableRows(usersStore.users))

const resolveIsActiveForKey = (filterKey: string): boolean | undefined => {
  if (filterKey === 'active') return true
  if (filterKey === 'inactive') return false
  return undefined
}

const resolveIsActiveFilter = (): boolean | undefined =>
  resolveIsActiveForKey(statusFilter.value)

const extractUsersTotal = (response: Awaited<ReturnType<typeof usersService.getUsers>>['response']) => {
  if (Array.isArray(response)) return response.length
  return response.total ?? response.data?.length ?? response.items?.length ?? response.users?.length ?? 0
}

const refreshFilterTotals = async () => {
  const results = await Promise.all(
    statusFilterDefinitions.map(async (option) => {
      try {
        const { response } = await usersService.getUsers({
          amount: 1,
          page: 1,
          search: debouncedSearch.value || undefined,
          isAdmin: true,
          isActive: resolveIsActiveForKey(option.key),
        })

        return [option.key, extractUsersTotal(response)] as const
      } catch {
        return [option.key, filterTotals.value[option.key] ?? 0] as const
      }
    }),
  )

  filterTotals.value = Object.fromEntries(results)
}

const hasUserEmail = (value: unknown) => {
  if (typeof value !== 'string') return false
  const email = value.trim()
  return email.length > 0 && email !== '-'
}

const resolveUserFromRow = (row: UTableRow): User | null => {
  if (row.id == null) return null
  return usersStore.users.find((item) => item.id === String(row.id)) ?? null
}

const getUserForRow = (row: UTableRow) => resolveUserFromRow(row)

const fetchUsers = async (page: number, options: { refreshTotals?: boolean } = {}) => {
  currentPage.value = page

  await withTableLoading(async () => {
    await usersStore.getUsers({
      amount: amount.value,
      page,
      search: debouncedSearch.value || undefined,
      isAdmin: true,
      isActive: resolveIsActiveFilter(),
    })
    expandedCompaniesRowKey.value = null
  })

  filterTotals.value = {
    ...filterTotals.value,
    [statusFilter.value]: usersStore.total,
  }

  if (options.refreshTotals) {
    void refreshFilterTotals()
  }
}

const handleReload = async () => {
  if (isLoading.value) return

  searchQuery.value = ''
  statusFilter.value = 'all'
  currentPage.value = 1

  await withTableLoading(async () => {
    await usersStore.getUsers({
      amount: amount.value,
      page: 1,
      isAdmin: true,
    })
    expandedCompaniesRowKey.value = null
  })

  filterTotals.value = {
    ...filterTotals.value,
    all: usersStore.total,
  }
  void refreshFilterTotals()
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
  await fetchUsers(currentPage.value, { refreshTotals: true })
}

const handleCreateUser = () => {
  createModalOpen.value = true
}

const closeCreateModal = () => {
  createModalOpen.value = false
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

const openAssignCompaniesModal = async (row: UTableRow) => {
  const user = resolveUserFromRow(row)
  if (!user) return

  assignCompaniesUser.value = user
  await nextTick()
  assignCompaniesModalOpen.value = true
}

const closeAssignCompaniesModal = () => {
  assignCompaniesModalOpen.value = false
  assignCompaniesUser.value = null
}

const isCompaniesActionExpanded = (row: UTableRow, action: UTableActionButton) =>
  expandedCompaniesRowKey.value != null
  && row.id === expandedCompaniesRowKey.value
  && action.key === 'companies'

const handleRowAction = async ({ action, row }: { action: string, row: UTableRow }) => {
  if (action === 'companies') {
    const rowKey = row.id
    if (rowKey == null) return
    expandedCompaniesRowKey.value = expandedCompaniesRowKey.value === rowKey ? null : rowKey
    return
  }

  if (expandedCompaniesRowKey.value != null) {
    expandedCompaniesRowKey.value = null
  }

  if (row.id == null) return

  if (action === 'edit') {
    await openEditModal(row)
    return
  }

  if (action === 'assignCompanies') {
    await openAssignCompaniesModal(row)
  }
}

watch(debouncedSearch, async () => {
  if (!isInitialLoadDone.value) return
  await fetchUsers(1, { refreshTotals: true })
})

watch(statusFilter, async () => {
  if (!isInitialLoadDone.value) return
  await fetchUsers(1)
})

onMounted(async () => {
  await fetchUsers(currentPage.value, { refreshTotals: true })
  isInitialLoadDone.value = true
})
</script>
