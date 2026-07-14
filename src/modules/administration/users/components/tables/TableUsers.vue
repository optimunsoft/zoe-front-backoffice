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
          <div class="relative w-full sm:w-72">
            <InputSearch
              v-model="companySearchQuery"
              placeholder="Buscar por empresa..."
              search-label="Buscar por empresa"
              @submit="handleCompanySearch"
            />

            <div
              v-if="showCompanySuggestions"
              class="absolute top-full z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700/60 dark:bg-gray-800"
            >
              <button
                v-for="company in companySearchResults"
                :key="company.id"
                type="button"
                class="flex w-full border-b border-gray-100 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-800/60"
                @click="selectCompanyOption(company)"
              >
                <span class="truncate text-sm text-gray-800 dark:text-gray-100">
                  {{ company.label }}
                </span>
              </button>

              <p
                v-if="companySearchResults.length === 0 && !isSearchingCompanies"
                class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
              >
                No se encontraron empresas.
              </p>

              <p
                v-else-if="isSearchingCompanies"
                class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
              >
                Buscando...
              </p>
            </div>
          </div>

          <div class="w-full sm:w-64">
            <InputSearch
              v-model="searchQuery"
              placeholder="Buscar por Nombre..."
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

    <TableInitialLoader
      v-if="showInitialLoader"
      message="Cargando usuarios..."
    />

    <UTable
      v-else
      title="Todos los usuarios"
      :count="users.length"
      :columns="visibleColumns"
      :rows="users"
      :refreshing="isTableRefreshing"
      show-actions
      actions-mode="inline"
      actions-label="Acciones"
      :expanded-row-key="expandedCompaniesRowKey"
      expanded-action-key="companies"
      @action="handleRowAction"
    >
      <template #actions="{ row }">
        <div class="flex justify-start space-x-1">
          <Tooltip
            v-for="action in resolveUserTableActions()"
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
        <TableUserCompanies
          v-if="getUserForRow(row)"
          :user="getUserForRow(row)!"
          @permissions="handleOpenPermissionsModal"
        />
      </template>

      <template #cell-email="{ row }">
        <span v-if="hasUserEmail(row.email)" class="text-gray-800 dark:text-gray-100">
          {{ row.email }}
        </span>
        <TableBadge v-else color="neutral">
          {{ formatTableText('No Aplica') }}
        </TableBadge>
      </template>

      <template #cell-isAdmin="{ row }">
        <TableBadge v-if="row.isAdminUser" color="primary">
          {{ formatTableText('Superusuario') }}
        </TableBadge>
        <TableBadge v-else color="neutral">
          {{ formatTableText('No Aplica') }}
        </TableBadge>
      </template>
    </UTable>

    <div class="mt-4" :class="{ 'pointer-events-none opacity-60': isLoading }">
      <PaginationClassic
        :page="currentPage"
        :amount="amount"
        :total="usersStore.total as number"
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

    <ModalPermissionRolUser
      :modal-open="permissionsModalOpen"
      :company-id="permissionsContext.companyId"
      :company-name="permissionsContext.companyName"
      :user="permissionsContext.user"
      @close-modal="handleClosePermissionsModal"
    />

    <ModalUserSessions
      :modal-open="sessionsModalOpen"
      :user="sessionsUser"
      @close-modal="closeSessionsModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

import { useCompanyStore } from '~/core/company/store/company.store'
import ModalPermissionRolUser from '~/core/company/components/modals/ModalPermissionRolUser.vue'
import type { CompanyList, userCompany } from '~/core/company/types/company.types'
import { Button, ReloadButton } from '~/core/ui/buttons'
import { UiIcon } from '~/core/ui/icons'
import { TableBadge } from '~/core/ui/badge'
import { Tooltip } from '~/core/ui/utooltip'
import TableColumnToggle from '~/core/ui/dropdown/TableColumnToggle.vue'
import { FilterPills } from '~/core/ui/filters'
import { useModal } from '~/core/ui/modal'
import InputSearch from '~/core/ui/inputs/InputSearch.vue'
import PaginationClassic from '~/core/ui/pagination/PaginationClassic.vue'
import { UTable, TableInitialLoader } from '~/core/ui/Tables'
import type { UTableActionButton, UTableRow } from '~/core/ui/Tables/utable.types'
import { formatTableText } from '~/shared/utils/format'
import { useTableRefresh } from '~/shared/composables/use-table-refresh'
import { mapUsersToTableRows, userColumns } from '~/modules/administration/users/mappers/user-tables-mappers'
import { resolveUserTableActions } from '~/modules/administration/users/mappers/user-table.actions'
import ModalCreate from '~/modules/administration/users/components/modals/ModalCreate.vue'
import ModalEdit from '~/modules/administration/users/components/modals/ModalEdit.vue'
import ModalUserSessions from '~/modules/administration/users/components/modals/ModalUserSessions.vue'
import TableUserCompanies from '~/modules/administration/users/components/tables/TableUserCompanies.vue'
import type { FilterPillOption } from '~/core/ui/filters/filter-pills.types'
import { useUsersStore } from '~/modules/administration/users/store/users.store'
import { USER_TYPE, type GetUsersParams, type User } from '~/modules/administration/users/types/users.types'
import { useToast } from '~/core/ui/toast'
import { useVisibleTableColumns } from '~/shared/composables/use-visible-table-columns'
import { UI_TABLE_ICON_BUTTON_CLASSES } from '~/core/ui/interactive.classes'

type PermissionsContext = {
  companyId: string
  companyName: string
  user: userCompany | null
}

type CompanySearchOption = {
  id: string
  label: string
}

const usersStore = useUsersStore()
const companyStore = useCompanyStore()
const toast = useToast()
const { modalOpen: permissionsModalOpen, open: openPermissionsModal, close: closePermissionsModal } = useModal()
const permissionsContext = ref<PermissionsContext>({
  companyId: '',
  companyName: '',
  user: null,
})
const selectedItems = ref<Array<string | number>>([])
const searchQuery = ref('')
const debouncedSearch = refDebounced(searchQuery, 400)
const companySearchQuery = ref('')
const debouncedCompanySearch = refDebounced(companySearchQuery, 400)
const companySearchResults = ref<CompanySearchOption[]>([])
const isSearchingCompanies = ref(false)
const hasCompanySearchAttempt = ref(false)
const appliedCompanyLabel = ref('')
const selectedCompanyId = ref<string | undefined>()
const userFilter = ref('all')
const currentPage = ref(1)
const amount = ref(10)
const {
  isLoading,
  isInitialLoadDone,
  isTableRefreshing,
  showInitialLoader,
  withTableLoading,
} = useTableRefresh()
const createModalOpen = ref(false)
const editModalOpen = ref(false)
const editingUser = ref<User | null>(null)
const sessionsModalOpen = ref(false)
const sessionsUser = ref<User | null>(null)
const expandedCompaniesRowKey = ref<string | number | null>(null)

const userFilterDefinitions = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'inactive', label: 'Inactivos' },
  { key: 'isAdmin', label: 'Superusuarios' },
  { key: USER_TYPE.USUARIO, label: 'Usuario' },
  { key: USER_TYPE.SUBUSUARIO, label: 'Subusuario' },
] as const

const {
  visibleKeys: visibleColumnKeys,
  visibleColumns,
  resetVisibleColumns,
} = useVisibleTableColumns(userColumns, { storageKey: 'table-columns:users' })

const userFilterOptions = computed<FilterPillOption[]>(() =>
  userFilterDefinitions.map((option) => ({
    key: option.key,
    label: option.label,
    count: userFilter.value === option.key ? usersStore.total : undefined,
  })),
)

const resolveListQueryParams = (): Pick<GetUsersParams, 'isAdmin' | 'isActive' | 'type'> => {
  if (userFilter.value === 'active') {
    return { isActive: true, isAdmin: undefined, type: undefined }
  }

  if (userFilter.value === 'inactive') {
    return { isActive: false, isAdmin: undefined, type: undefined }
  }

  if (userFilter.value === 'isAdmin') {
    return { isAdmin: true, isActive: undefined, type: undefined }
  }

  if (userFilter.value === USER_TYPE.USUARIO) {
    return { type: USER_TYPE.USUARIO, isAdmin: undefined, isActive: undefined }
  }

  if (userFilter.value === USER_TYPE.SUBUSUARIO) {
    return { type: USER_TYPE.SUBUSUARIO, isAdmin: undefined, isActive: undefined }
  }

  return { isAdmin: undefined, isActive: undefined, type: undefined }
}

const formatCompanyLabel = (company: CompanyList) => {
  const businessName = company.businessName?.trim()
  if (businessName) return businessName

  const tradeName = company.tradeName?.trim()
  if (tradeName) return tradeName

  const documentNumber = company.documentNumber?.trim()
  if (documentNumber) return documentNumber

  return company.id
}

const showCompanySuggestions = computed(() => {
  const query = companySearchQuery.value.trim()
  if (!query || query === appliedCompanyLabel.value.trim()) return false

  return isSearchingCompanies.value || hasCompanySearchAttempt.value
})

const searchCompanies = async (term: string) => {
  const normalized = term.trim()
  companySearchResults.value = []

  if (!normalized) {
    hasCompanySearchAttempt.value = false
    selectedCompanyId.value = undefined
    appliedCompanyLabel.value = ''
    return false
  }

  if (normalized === appliedCompanyLabel.value.trim()) {
    return false
  }

  isSearchingCompanies.value = true
  hasCompanySearchAttempt.value = true

  try {
    await companyStore.getCompanies({
      page: 1,
      amount: 10,
      search: normalized,
    })

    companySearchResults.value = companyStore.companies.map((company) => ({
      id: company.id,
      label: formatCompanyLabel(company),
    }))
  } finally {
    isSearchingCompanies.value = false
  }

  return true
}

const selectCompanyOption = async (company: CompanySearchOption) => {
  selectedCompanyId.value = company.id
  appliedCompanyLabel.value = company.label
  companySearchQuery.value = company.label
  companySearchResults.value = []
  hasCompanySearchAttempt.value = false
  currentPage.value = 1
  await fetchUsers(1)
}

const handleCompanySearch = async () => {
  const shouldRefetch = await searchCompanies(companySearchQuery.value)
  if (!shouldRefetch) return

  if (!companySearchQuery.value.trim()) {
    currentPage.value = 1
    await fetchUsers(1)
  }
}

watch(debouncedCompanySearch, async (term) => {
  const normalized = term.trim()

  if (!normalized) {
    if (selectedCompanyId.value || appliedCompanyLabel.value) {
      selectedCompanyId.value = undefined
      appliedCompanyLabel.value = ''
      currentPage.value = 1
      await fetchUsers(1)
    }
    return
  }

  if (normalized === appliedCompanyLabel.value.trim()) return

  selectedCompanyId.value = undefined
  await searchCompanies(normalized)
})

watch(debouncedSearch, () => {
  if (!isInitialLoadDone.value) return
  currentPage.value = 1
  fetchUsers(1)
})

watch(userFilter, () => {
  if (!isInitialLoadDone.value) return
  currentPage.value = 1
  fetchUsers(1)
})

const users = computed(() => mapUsersToTableRows(usersStore.users))

const resolveUserFromRow = (row: UTableRow): User | null => {
  const rowId = row.id == null ? '' : String(row.id).trim()
  if (!rowId) return null

  return usersStore.users.find((user) => user.id === rowId) ?? null
}

const getUserForRow = (row: UTableRow) => resolveUserFromRow(row)

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

const openSessionsModal = async (row: UTableRow) => {
  const user = resolveUserFromRow(row)
  if (!user) return

  sessionsUser.value = user
  await nextTick()
  sessionsModalOpen.value = true
}

const closeSessionsModal = () => {
  sessionsModalOpen.value = false
  sessionsUser.value = null
}

const closeCreateModal = () => {
  createModalOpen.value = false
}

const isCompaniesActionExpanded = (row: UTableRow, action: UTableActionButton) =>
  expandedCompaniesRowKey.value != null
  && row.id === expandedCompaniesRowKey.value
  && action.key === 'companies'

const handleOpenPermissionsModal = async (payload: PermissionsContext) => {
  if (!payload.user?.roles.length) {
    toast.warning('Este usuario no tiene roles asignados en esta empresa.')
    return
  }

  permissionsContext.value = {
    companyId: payload.companyId,
    companyName: payload.companyName,
    user: payload.user,
  }
  await nextTick()
  openPermissionsModal()
}

const handleClosePermissionsModal = () => {
  permissionsContext.value = {
    companyId: '',
    companyName: '',
    user: null,
  }
  closePermissionsModal()
}

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

  if (action === 'sessions') {
    await openSessionsModal(row)
  }
}

const hasUserEmail = (value: unknown) => {
  if (typeof value !== 'string') return false
  const email = value.trim()
  return email.length > 0 && email !== '-'
}

const fetchUsers = async (page: number) => {
  currentPage.value = page

  await withTableLoading(async () => {
    await usersStore.getUsers({
      amount: amount.value,
      page,
      search: debouncedSearch.value || undefined,
      companyId: selectedCompanyId.value,
      ...resolveListQueryParams(),
    })
    selectedItems.value = []
    expandedCompaniesRowKey.value = null
  })
}

const handleUsersMutated = async () => {
  await fetchUsers(currentPage.value)
}

const handleCreateUser = () => {
  createModalOpen.value = true
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

const handleReload = async () => {
  if (isLoading.value) return
  await fetchUsers(currentPage.value)
}

onMounted(() => {
  fetchUsers(currentPage.value)
})
</script>
