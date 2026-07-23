<template>
  <div class="px-4 sm:px-6 lg:px-8 pt-12 pb-8 w-full max-w-[96rem] mx-auto">
    <div class="mb-8 flex flex-col gap-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Empresas
        </h1>

        <Button
          class="w-full sm:w-auto"
          variant="primary"
          aria-controls="new-company-modal"
          @click="handleCreateCompany"
        >
          <template #icon>
            <UiIcon name="plus" size="sm" />
          </template>
          Nueva empresa
        </Button>
      </div>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <FilterCards
          v-model="companyFilter"
          :options="companyFilterOptions"
          :loading="isFilterTotalsLoading"
          aria-label="Filtrar empresas por entorno"
          wrapper-class="mb-0"
        />

        <div class="flex w-full flex-wrap items-center justify-start sm:w-auto sm:justify-end gap-2 sm:gap-3">
          <div class="relative w-full sm:w-72">
            <InputSearch
              v-model="locationSearchQuery"
              placeholder="Departamento o municipio..."
              search-label="Buscar por departamento o municipio"
              @submit="handleLocationSearch"
            />

            <div
              v-if="showLocationSuggestions"
              class="absolute top-full z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700/60 dark:bg-gray-800"
            >
              <button
                v-for="option in locationSearchResults"
                :key="option.key"
                type="button"
                class="flex w-full border-b border-gray-100 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-800/60"
                @click="selectLocationOption(option)"
              >
                <span class="truncate text-sm text-gray-800 dark:text-gray-100">
                  {{ option.label }}
                </span>
              </button>

              <p
                v-if="locationSearchResults.length === 0 && !isSearchingLocations"
                class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
              >
                No se encontraron departamentos o municipios.
              </p>

              <p
                v-else-if="isSearchingLocations"
                class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
              >
                Buscando...
              </p>
            </div>
          </div>

          <div class="w-full sm:w-64">
            <InputSearch
              v-model="searchQuery"
              placeholder="Buscar por Nit o Razón social..."
              search-label="Buscar"
              @submit="handleSearch"
            />
          </div>

          <TableColumnToggle
            v-model="visibleColumnKeys"
            :columns="companyColumns"
            align="right"
            @reset="resetVisibleColumns"
          />
          <ReloadButton :loading="isLoading" @click="handleReload" />
        </div>
      </div>
    </div>

    <TableInitialLoader
      v-if="showInitialLoader"
      message="Cargando empresas..."
    />

    <UTable
      v-else
      title="Todas las empresas"
      :count="totalCompanies"
      :columns="visibleColumns"
      :rows="rows"
      :refreshing="isTableRefreshing"
      show-actions
      actions-mode="inline"
      actions-label="Acciones"
      :action-buttons="companyTableActions"
      :expanded-row-key="expandedUsersRowKey"
      expanded-action-key="users"
      @action="handleRowAction"
    >
      <template #cell-documentNumber="{ row }">
        <div class="inline-flex min-w-[16ch] items-center justify-start gap-2">
          <TableBadge
            v-if="row.documentType && row.documentType !== '-'"
            :color="(row.documentTypeColor as 'success' | 'warning' | 'neutral') || 'neutral'"
            badge-class="shrink-0"
          >
            {{ row.documentType }}
          </TableBadge>
          <span
            v-else
            class="shrink-0 text-gray-400 dark:text-gray-500"
          >
            -
          </span>
          <span class="min-w-0 font-medium tabular-nums text-left text-gray-800 dark:text-gray-100">
            {{ row.documentNumber }}
          </span>
        </div>
      </template>

      <template #cell-municipality="{ row }">
        <Tooltip
          v-if="row.municipalityCity && row.municipalityCity !== '-'"
          class="inline-block max-w-full text-left cursor-pointer"
          position="top"
          size="sm"
        >
          <template #trigger>
            <span class="block truncate text-left text-gray-800 dark:text-gray-100">
              {{ formatTableText(row.municipalityCity) }}
            </span>
          </template>
          <div class="text-xs leading-relaxed">
            <p>{{ formatTableText(row.municipalityCity) }}</p>
            <p
              v-if="row.municipalityState && row.municipalityState !== '-'"
              class="text-gray-500 dark:text-gray-400"
            >
              {{ formatTableText(row.municipalityState) }}
            </p>
          </div>
        </Tooltip>
        <span v-else class="text-gray-400 dark:text-gray-500">-</span>
      </template>

      <template #row-detail="{ row }">
        <TableCompanyUsers
          v-if="row.id != null"
          :company-id="String(row.id)"
          :company-name="formatTableText(row.businessName)"
          @permissions="handleOpenPermissionsModal"
        />
      </template>
    </UTable>

    <div class="mt-4" :class="{ 'pointer-events-none opacity-60': isLoading }">
      <PaginationClassic
        :page="currentPage"
        :amount="amount"
        :total="totalCompanies"
        @change-page="handleChangePage"
        @change-amount="handleChangeAmount"
      />
    </div>

    <ModalCreate
      v-if="createModalMounted"
      :modal-open="createModalOpen"
      @close-modal="closeCreateModal"
      @created="handleCompanyCreated"
    />

    <ModalEdit
      v-if="editModalMounted"
      :modal-open="editModalOpen"
      :company="editingCompany"
      @close-modal="handleCloseEditModal"
      @updated="handleCompanyUpdated"
      @status-updated="handleCompanyStatusUpdated"
    />

    <ModalPermissionRolUser
      v-if="permissionsModalMounted"
      :modal-open="permissionsModalOpen"
      :company-id="permissionsContext.companyId"
      :company-name="permissionsContext.companyName"
      :user="permissionsContext.user"
      @close-modal="handleClosePermissionsModal"
    />

    <ModalAssignUsers
      v-if="assignUsersModalMounted"
      :modal-open="assignUsersModalOpen"
      :company-id="assignUsersContext.companyId"
      :company-name="assignUsersContext.companyName"
      @close-modal="handleCloseAssignUsersModal"
      @updated="handleAssignUsersUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { refDebounced, watchDebounced } from '@vueuse/core'

import { useCatalogStore } from '~/core/catalog/store/catalog.store'
import { useBusinessNatureStore } from '~/core/businessNature/store/businessNature.store'
import {
  companyColumns,
  mapCompaniesToTableRows,
} from '~/core/company/mappers/company-table.mapper'
import {
  mapMunicipalitySearchToLocationOptions,
  type CompanyLocationSearchOption,
} from '~/core/company/mappers/company-location.mapper'
import { companyTableActions } from '~/core/company/mappers/company-table.actions'
import type { Company, PaginatedCompaniesResponse, userCompany } from '~/core/company/types/company.types'
import { useCompanyStore } from '~/core/company/store/company.store'
import { useCompanyService } from '~/core/company/services/company.service'
import { useVatRegimeStore } from '~/core/vatRegime/store/vatRegime.store'
import { Button, ReloadButton } from '~/core/ui/buttons'
import { UiIcon } from '~/core/ui/icons'
import { FilterCards } from '~/core/ui/filters'
import type { FilterCardOption } from '~/core/ui/filters/filter-cards.types'
import { useModal } from '~/core/ui/modal'
import TableColumnToggle from '~/core/ui/dropdown/TableColumnToggle.vue'
import InputSearch from '~/core/ui/inputs/InputSearch.vue'
import PaginationClassic from '~/core/ui/pagination/PaginationClassic.vue'
import { TableBadge } from '~/core/ui/badge'
import { Tooltip } from '~/core/ui/Utooltip'
import { UTable, TableInitialLoader } from '~/core/ui/Tables'
import type { UTableRow } from '~/core/ui/Tables/utable.types'
import { useTableRefresh } from '~/shared/composables/use-table-refresh'
import { formatTableText } from '~/shared/utils/format'
import { useVisibleTableColumns } from '~/shared/composables/use-visible-table-columns'
import TableCompanyUsers from './TableCompanyUsers.vue'
import { useAuthStore } from '~/core/auth/store/auth.store'
import { useMunicipalityService } from '~/core/ubication/services/municipality.service'

const ModalCreate = defineAsyncComponent(() => import('../modals/ModalCreate.vue'))
const ModalEdit = defineAsyncComponent(() => import('../modals/ModalEdit.vue'))
const ModalPermissionRolUser = defineAsyncComponent(() => import('../modals/ModalPermissionRolUser.vue'))
const ModalAssignUsers = defineAsyncComponent(() => import('../modals/ModalAssignUsers.vue'))

type PermissionsContext = {
  companyId: string
  companyName: string
  user: userCompany | null
}

type AssignUsersContext = {
  companyId: string
  companyName: string
}

const catalogStore = useCatalogStore()
const authStore = useAuthStore()
const businessNatureStore = useBusinessNatureStore()
const companyStore = useCompanyStore()
const companyService = useCompanyService()
const vatRegimeStore = useVatRegimeStore()
const municipalityService = useMunicipalityService()

const selectedItems = ref<Array<string | number>>([])
const searchQuery = ref('')
const locationSearchQuery = ref('')
const locationSearchDebounced = refDebounced(locationSearchQuery, 400)
const locationSearchResults = ref<CompanyLocationSearchOption[]>([])
const isSearchingLocations = ref(false)
const hasLocationSearchAttempt = ref(false)
const appliedLocationLabel = ref('')
const companyFilter = ref('all')
const filterTotals = ref<Record<string, number>>({})
const isFilterTotalsLoading = ref(true)
const appliedStateId = ref('')
const appliedMunicipalityId = ref('')
const currentPage = ref(1)
const amount = ref(10)

const companyFilterDefinitions = [
  { key: 'all', label: 'Todos' },
  { key: 'production', label: 'Producción' },
  { key: 'demo', label: 'Pruebas/Demo' },
] as const

const {
  isLoading,
  isInitialLoadDone,
  isTableRefreshing,
  showInitialLoader,
  withTableLoading,
} = useTableRefresh(undefined, { initialLoading: true })
const expandedUsersRowKey = ref<string | number | null>(null)

const {
  visibleKeys: visibleColumnKeys,
  visibleColumns,
  resetVisibleColumns,
} = useVisibleTableColumns(companyColumns, { storageKey: 'table-columns:companies' })

const { modalOpen: createModalOpen, open: openCreateModal, close: closeCreateModal } = useModal()
const { modalOpen: editModalOpen, open: openEditModal, close: closeEditModal } = useModal()
const { modalOpen: permissionsModalOpen, open: openPermissionsModal, close: closePermissionsModal } = useModal()
const { modalOpen: assignUsersModalOpen, open: openAssignUsersModal, close: closeAssignUsersModal } = useModal()

const createModalMounted = ref(false)
const editModalMounted = ref(false)
const permissionsModalMounted = ref(false)
const assignUsersModalMounted = ref(false)

watch(createModalOpen, (open) => {
  if (open) createModalMounted.value = true
})
watch(editModalOpen, (open) => {
  if (open) editModalMounted.value = true
})
watch(permissionsModalOpen, (open) => {
  if (open) permissionsModalMounted.value = true
})
watch(assignUsersModalOpen, (open) => {
  if (open) assignUsersModalMounted.value = true
})
const editingCompany = ref<Company | null>(null)
const permissionsContext = ref<PermissionsContext>({
  companyId: '',
  companyName: '',
  user: null,
})
const assignUsersContext = ref<AssignUsersContext>({
  companyId: '',
  companyName: '',
})

const totalCompanies = computed(() => companyStore.total)

const companyFilterOptions = computed<FilterCardOption[]>(() =>
  companyFilterDefinitions.map((option) => ({
    key: option.key,
    label: option.label,
    count: filterTotals.value[option.key],
  })),
)

const resolveProductionForKey = (filterKey: string): boolean | undefined => {
  if (filterKey === 'production') return true
  if (filterKey === 'demo') return false
  return undefined
}

const resolveProductionFilter = (): boolean | undefined =>
  resolveProductionForKey(companyFilter.value)

const extractCompaniesTotal = (
  response: Awaited<ReturnType<typeof companyService.getCompanies>>['response'],
) => {
  if (Array.isArray(response)) return response.length
  const paginated = response as PaginatedCompaniesResponse
  return paginated.total
    ?? paginated.data?.length
    ?? paginated.items?.length
    ?? paginated.companies?.length
    ?? 0
}

const refreshFilterTotals = async () => {
  isFilterTotalsLoading.value = true

  try {
    const search = searchQuery.value.trim()
    const stateId = appliedStateId.value.trim()
    const municipalityId = appliedMunicipalityId.value.trim()

    const results = await Promise.all(
      companyFilterDefinitions.map(async (option) => {
        try {
          const production = resolveProductionForKey(option.key)
          const { response } = await companyService.getCompanies({
            amount: 1,
            page: 1,
            ...(search ? { search } : {}),
            ...(stateId ? { stateId } : {}),
            ...(municipalityId ? { municipalityId } : {}),
            ...(typeof production === 'boolean' ? { production } : {}),
          })

          return [option.key, extractCompaniesTotal(response)] as const
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

const showLocationSuggestions = computed(() => {
  const query = locationSearchQuery.value.trim()
  if (!query || query === appliedLocationLabel.value.trim()) return false

  return isSearchingLocations.value || hasLocationSearchAttempt.value
})

const searchLocations = async (term: string) => {
  const normalized = term.trim()
  locationSearchResults.value = []

  if (!normalized) {
    hasLocationSearchAttempt.value = false
    appliedStateId.value = ''
    appliedMunicipalityId.value = ''
    return false
  }

  const countryId = authStore.user?.countryId
  if (!countryId) return false

  isSearchingLocations.value = true

  try {
    const { response } = await municipalityService.search({
      countryId,
      name: normalized,
    })

    locationSearchResults.value = mapMunicipalitySearchToLocationOptions(
      response ?? [],
      normalized,
    )
    hasLocationSearchAttempt.value = true
    return true
  } catch {
    locationSearchResults.value = []
    hasLocationSearchAttempt.value = true
    return false
  } finally {
    isSearchingLocations.value = false
  }
}

const applyLocationFilter = async (option: CompanyLocationSearchOption) => {
  appliedStateId.value = option.stateId
  appliedMunicipalityId.value = option.municipalityId
  locationSearchResults.value = []
  await fetchCompanies(1, true, { refreshTotals: true })
}

const selectLocationOption = async (option: CompanyLocationSearchOption) => {
  appliedLocationLabel.value = option.label
  locationSearchQuery.value = option.label
  hasLocationSearchAttempt.value = false
  locationSearchResults.value = []
  await applyLocationFilter(option)
}

const clearLocationFilter = async () => {
  appliedStateId.value = ''
  appliedMunicipalityId.value = ''
  appliedLocationLabel.value = ''
  locationSearchResults.value = []
  hasLocationSearchAttempt.value = false

  if (!isInitialLoadDone.value || isLoading.value) return
  await fetchCompanies(1, true, { refreshTotals: true })
}

const rows = computed<UTableRow[]>(() =>
  mapCompaniesToTableRows(companyStore.companies, {
    businessNatures: businessNatureStore.businessNatures,
    vatRegimes: vatRegimeStore.vatRegimes,
  }),
)

const handleRowAction = ({ action, row }: { action: string, row: UTableRow }) => {
  if (action === 'users') {
    const rowKey = row.id
    if (rowKey == null) return
    expandedUsersRowKey.value = expandedUsersRowKey.value === rowKey ? null : rowKey
    return
  }

  if (expandedUsersRowKey.value != null) {
    expandedUsersRowKey.value = null
  }

  if (action === 'assign-users') {
    if (row.id == null) return

    handleOpenAssignUsersModal({
      companyId: String(row.id),
      companyName: formatTableText(row.businessName),
    })
    return
  }

  if (action === 'edit') {
    if (row.id == null) return

    const company = companyStore.getCompanyFromList(String(row.id))
    if (!company) return

    editingCompany.value = company
    openEditModal()
    return
  }

  // TODO: conectar eliminar con API / navegación
  console.log(action, row.id)
}

const buildCompaniesRequestParams = (page: number) => {
  const search = searchQuery.value.trim()
  const stateId = appliedStateId.value.trim()
  const municipalityId = appliedMunicipalityId.value.trim()
  const production = resolveProductionFilter()

  return {
    amount: amount.value,
    page,
    ...(search ? { search } : {}),
    ...(stateId ? { stateId } : {}),
    ...(municipalityId ? { municipalityId } : {}),
    ...(typeof production === 'boolean' ? { production } : {}),
  }
}

const applyLocationSearch = async () => {
  if (isLoading.value) return

  const term = locationSearchQuery.value.trim()
  if (!term) {
    await clearLocationFilter()
    return
  }

  if (term === appliedLocationLabel.value.trim()) return

  await searchLocations(term)

  if (locationSearchResults.value.length === 1) {
    await selectLocationOption(locationSearchResults.value[0]!)
  }
}

const fetchCompanies = async (
  page: number,
  force = false,
  options: { refreshTotals?: boolean; forceCatalog?: boolean } = {},
) => {
  currentPage.value = page

  const totalsPromise = options.refreshTotals
    ? refreshFilterTotals()
    : Promise.resolve()

  await withTableLoading(async () => {
    // Catálogos de core: se reutilizan del store (casi no cambian). Solo se fuerza en reload explícito.
    await catalogStore.preload(options.forceCatalog === true)
    await companyStore.getCompanies(buildCompaniesRequestParams(page), force)
    selectedItems.value = []
    expandedUsersRowKey.value = null
  })

  await totalsPromise

  filterTotals.value = {
    ...filterTotals.value,
    [companyFilter.value]: companyStore.total,
  }
}

const handleCreateCompany = () => {
  openCreateModal()
}

const handleCompanyCreated = async () => {
  await fetchCompanies(currentPage.value, true, { refreshTotals: true })
}

const handleCloseEditModal = () => {
  editingCompany.value = null
  closeEditModal()
}

const handleOpenPermissionsModal = (payload: { companyId: string, user: userCompany }) => {
  const company = companyStore.getCompanyFromList(payload.companyId)

  permissionsContext.value = {
    companyId: payload.companyId,
    companyName: company?.businessName || company?.tradeName || '',
    user: payload.user,
  }
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

const handleOpenAssignUsersModal = (payload: { companyId: string, companyName: string }) => {
  const company = companyStore.getCompanyFromList(payload.companyId)

  assignUsersContext.value = {
    companyId: payload.companyId,
    companyName: payload.companyName || company?.businessName || company?.tradeName || '',
  }
  openAssignUsersModal()
}

const handleCloseAssignUsersModal = () => {
  assignUsersContext.value = {
    companyId: '',
    companyName: '',
  }
  closeAssignUsersModal()
}

const handleAssignUsersUpdated = async () => {
  await fetchCompanies(currentPage.value, true, { refreshTotals: true })
}

const handleCompanyStatusUpdated = (active: boolean) => {
  if (!editingCompany.value) return

  editingCompany.value = {
    ...editingCompany.value,
    isActive: active,
  }
}

const handleCompanyUpdated = async () => {
  await fetchCompanies(currentPage.value, true, { refreshTotals: true })
}

const handleChangePage = async (page: number) => {
  if (isLoading.value || page === currentPage.value) return
  await fetchCompanies(page)
}

const handleChangeAmount = async (nextAmount: number) => {
  if (isLoading.value || nextAmount === amount.value) return
  amount.value = nextAmount
  await fetchCompanies(1, true)
}

const handleReload = async () => {
  if (isLoading.value) return

  searchQuery.value = ''
  locationSearchQuery.value = ''
  locationSearchResults.value = []
  isSearchingLocations.value = false
  hasLocationSearchAttempt.value = false
  appliedLocationLabel.value = ''
  appliedStateId.value = ''
  appliedMunicipalityId.value = ''
  companyFilter.value = 'all'
  currentPage.value = 1

  await fetchCompanies(1, true, { refreshTotals: true, forceCatalog: true })
}

const handleSearch = async () => {
  if (isLoading.value) return
  await fetchCompanies(1, true, { refreshTotals: true })
}

const handleLocationSearch = async () => {
  await applyLocationSearch()
}

watchDebounced(
  locationSearchDebounced,
  async (term) => {
    if (!isInitialLoadDone.value) return

    const normalized = term.trim()

    if (!normalized) {
      await clearLocationFilter()
      return
    }

    if (normalized === appliedLocationLabel.value.trim()) return

    if (appliedLocationLabel.value) {
      const hadFilter = Boolean(appliedStateId.value || appliedMunicipalityId.value)
      appliedLocationLabel.value = ''
      appliedStateId.value = ''
      appliedMunicipalityId.value = ''

      if (hadFilter) {
        await fetchCompanies(1, true, { refreshTotals: true })
      }
    }

    await searchLocations(term)
  },
  { debounce: 0 },
)

watchDebounced(
  searchQuery,
  async () => {
    if (!isInitialLoadDone.value || isLoading.value) return
    await fetchCompanies(1, true, { refreshTotals: true })
  },
  { debounce: 400 },
)

watch(companyFilter, async () => {
  if (!isInitialLoadDone.value || isLoading.value) return
  await fetchCompanies(1, true)
})

onMounted(async () => {
  await fetchCompanies(currentPage.value, false, { refreshTotals: true })
})
</script>
