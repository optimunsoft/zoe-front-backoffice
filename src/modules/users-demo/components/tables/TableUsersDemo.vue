<template>
  <div class="w-full">
    <div class="mb-8 flex flex-col gap-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Usuarios Demo
        </h1>
      </div>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <FilterCards
          v-model="statusFilter"
          :options="statusFilterOptions"
          :loading="isFilterTotalsLoading"
          aria-label="Filtrar usuarios demo por estado"
          wrapper-class="mb-0"
        />

        <div class="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <div class="w-full sm:w-64">
            <InputSearch
              v-model="searchQuery"
              placeholder="Buscar por Nombre o correo..."
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
      :action-buttons="visibleTableActions"
      :expanded-row-key="expandedCompaniesRowKey"
      expanded-action-key="companies"
      empty-text="No hay usuarios demo registrados"
      @action="handleRowAction"
    >
      <template #row-detail="{ row }">
        <TableUserCompanies
          v-if="resolveUserFromRow(row)"
          :user="resolveUserFromRow(row)!"
          @permissions="handleOpenPermissionsModal"
        />
      </template>

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
      v-if="editModalMounted"
      :modal-open="editModalOpen"
      :user="editingUser"
      @close-modal="closeEditModal"
      @updated="handleUsersMutated"
      @status-updated="handleStatusUpdated"
    />

    <ModalDelete
      v-if="deleteModalMounted"
      :modal-open="deleteModalOpen"
      :user-id="selectedDeleteId"
      :user-name="selectedDeleteName"
      :company-name="selectedDeleteCompanyName"
      @close-modal="closeDeleteModal"
      @confirm="handleDeleteConfirm"
    />

    <ModalConfirmDelete
      v-if="confirmDeleteModalMounted"
      :modal-open="confirmDeleteModalOpen"
      :user-id="selectedDeleteId"
      :user-name="selectedDeleteName"
      :company-name="selectedDeleteCompanyName"
      @close-modal="closeConfirmDeleteModal"
      @deleted="handleDeleted"
    />

    <ModalPermissionRolUser
      v-if="permissionsModalMounted"
      :modal-open="permissionsModalOpen"
      :company-id="permissionsContext.companyId"
      :company-name="permissionsContext.companyName"
      :user="permissionsContext.user"
      @close-modal="handleClosePermissionsModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onMounted, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

import type { userCompany } from '~/core/company/types/company.types'
import { useAuthStore } from '~/core/auth/store/auth.store'
import { UBadge } from '~/core/ui/badge'
import { ReloadButton } from '~/core/ui/buttons'
import { FilterCards } from '~/core/ui/filters'
import type { FilterCardOption } from '~/core/ui/filters/filter-cards.types'
import { useUsersService } from '~/modules/administration/users/services/users.services'
import { UiIcon } from '~/core/ui/icons'
import InputSearch from '~/core/ui/inputs/InputSearch.vue'
import { useModal } from '~/core/ui/modal'
import PaginationClassic from '~/core/ui/pagination/PaginationClassic.vue'
import { UTable, TableInitialLoader } from '~/core/ui/Tables'
import type { UTableRow } from '~/core/ui/Tables/utable.types'
import { useToast } from '~/core/ui/toast'
import { formatTableText } from '~/shared/utils/format'
import { useCopyPhoneNumber } from '~/shared/composables/use-copy-phone-number'
import { useTableRefresh } from '~/shared/composables/use-table-refresh'
import { useUsersStore } from '~/modules/administration/users/store/users.store'
import type { User } from '~/modules/administration/users/types/users.types'
import TableUserCompanies from '~/modules/administration/users/components/tables/TableUserCompanies.vue'
import { resolveUsersDemoTableActions } from '../../mappers/users-demo-table.actions'
import {
  mapUsersDemoToTableRows,
  usersDemoColumns,
} from '../../mappers/users-demo-table.mapper'
import {
  formatUserCompanyName,
  getVisibleUserCompanies,
} from '~/modules/administration/users/mappers/user-companies.mapper'

const ModalPermissionRolUser = defineAsyncComponent(
  () => import('~/core/company/components/modals/ModalPermissionRolUser.vue'),
)
const ModalDelete = defineAsyncComponent(() => import('../modals/ModalDelete.vue'))
const ModalConfirmDelete = defineAsyncComponent(() => import('../modals/ModalConfirmDelete.vue'))
const ModalEdit = defineAsyncComponent(() => import('../modals/ModalEdit.vue'))

type PermissionsContext = {
  companyId: string
  companyName: string
  user: userCompany | null
}

const authStore = useAuthStore()
const usersStore = useUsersStore()
const usersService = useUsersService()
const toast = useToast()
const { isPhoneAnimating, isPhoneCopied, copyPhoneNumber } = useCopyPhoneNumber()
const searchQuery = ref('')
const debouncedSearch = refDebounced(searchQuery, 400)
const currentPage = ref(1)
const amount = ref(10)
const statusFilter = ref('all')
const filterTotals = ref<Record<string, number>>({})
const isFilterTotalsLoading = ref(true)
const expandedCompaniesRowKey = ref<string | number | null>(null)

const {
  modalOpen: permissionsModalOpen,
  open: openPermissionsModal,
  close: closePermissionsModal,
} = useModal()

const permissionsContext = ref<PermissionsContext>({
  companyId: '',
  companyName: '',
  user: null,
})

const visibleTableActions = computed(() =>
  resolveUsersDemoTableActions(authStore.isAdminBackOfficeUser),
)

const statusFilterDefinitions = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'inactive', label: 'Inactivos' },
] as const

const editModalOpen = ref(false)
const deleteModalOpen = ref(false)
const confirmDeleteModalOpen = ref(false)
const editModalMounted = ref(false)
const deleteModalMounted = ref(false)
const confirmDeleteModalMounted = ref(false)
const permissionsModalMounted = ref(false)

watch(editModalOpen, (open) => {
  if (open) editModalMounted.value = true
})
watch(deleteModalOpen, (open) => {
  if (open) deleteModalMounted.value = true
})
watch(confirmDeleteModalOpen, (open) => {
  if (open) confirmDeleteModalMounted.value = true
})
watch(permissionsModalOpen, (open) => {
  if (open) permissionsModalMounted.value = true
})
const editingUser = ref<User | null>(null)
const selectedDeleteId = ref<string | null>(null)
const selectedDeleteName = ref('')
const selectedDeleteCompanyName = ref('')
const isInitialLoadDone = ref(false)

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
    count: filterTotals.value[option.key],
  })),
)

const tableRows = computed(() => mapUsersDemoToTableRows(usersStore.users))

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
  isFilterTotalsLoading.value = true

  try {
    const results = await Promise.all(
      statusFilterDefinitions.map(async (option) => {
        try {
          const { response } = await usersService.getUsers({
            amount: 1,
            page: 1,
            search: debouncedSearch.value || undefined,
            isDemo: true,
            isActive: resolveIsActiveForKey(option.key),
          })

          return [option.key, extractUsersTotal(response)] as const
        } catch {
          return [option.key, filterTotals.value[option.key] ?? 0] as const
        }
      }),
    )

    filterTotals.value = Object.fromEntries(results)
  } finally {
    isFilterTotalsLoading.value = false
  }
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

const fetchUsers = async (page: number, options: { refreshTotals?: boolean } = {}) => {
  currentPage.value = page

  const totalsPromise = options.refreshTotals
    ? refreshFilterTotals()
    : Promise.resolve()

  await withTableLoading(async () => {
    await usersStore.getUsers({
      amount: amount.value,
      page,
      search: debouncedSearch.value || undefined,
      isDemo: true,
      isActive: resolveIsActiveFilter(),
    })
  })

  await totalsPromise

  filterTotals.value = {
    ...filterTotals.value,
    [statusFilter.value]: usersStore.total,
  }
}

const handleReload = async () => {
  if (isLoading.value || isFilterTotalsLoading.value) return

  searchQuery.value = ''
  statusFilter.value = 'all'
  currentPage.value = 1
  expandedCompaniesRowKey.value = null

  await fetchUsers(1, { refreshTotals: true })
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

const handleStatusUpdated = (active: boolean) => {
  if (!editingUser.value) return

  editingUser.value = {
    ...editingUser.value,
    isActive: active,
  }
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

  const user = resolveUserFromRow(row)
  const companies = getVisibleUserCompanies(user?.companies)
  const companyFromUser = companies.map(formatUserCompanyName).filter(Boolean).join(', ')
  const companyFromRow = String(row.companyName ?? '').trim()
  const companyName = companyFromUser
    || (companyFromRow && companyFromRow !== '-' ? companyFromRow : '')

  const userName = user
    ? [user.firstName, user.lastName].map((part) => part?.trim()).filter(Boolean).join(' ')
    : String(row.fullName ?? '').trim()

  selectedDeleteId.value = String(row.id)
  selectedDeleteName.value = userName && userName !== '-' ? userName : ''
  selectedDeleteCompanyName.value = companyName
  await nextTick()
  deleteModalOpen.value = true
}

const closeDeleteModal = () => {
  deleteModalOpen.value = false

  // Si no se abre la confirmación, limpiar selección.
  if (!confirmDeleteModalOpen.value) {
    selectedDeleteId.value = null
    selectedDeleteName.value = ''
    selectedDeleteCompanyName.value = ''
  }
}

const handleDeleteConfirm = async () => {
  confirmDeleteModalOpen.value = true
  await nextTick()
  deleteModalOpen.value = false
}

const closeConfirmDeleteModal = () => {
  confirmDeleteModalOpen.value = false
  selectedDeleteId.value = null
  selectedDeleteName.value = ''
  selectedDeleteCompanyName.value = ''
}

const handleDeleted = async () => {
  const isLastItemOnPage = usersStore.users.length === 1
  const shouldGoToPreviousPage = isLastItemOnPage && currentPage.value > 1
  const nextPage = shouldGoToPreviousPage
    ? currentPage.value - 1
    : currentPage.value

  await fetchUsers(nextPage, { refreshTotals: true })
}

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

  if (action === 'edit') {
    await openEditModal(row)
    return
  }

  if (action === 'delete') {
    if (!authStore.isAdminBackOfficeUser) return
    await openDeleteModal(row)
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
