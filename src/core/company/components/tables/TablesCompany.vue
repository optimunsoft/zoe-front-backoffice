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
        <FilterPills
          v-model="companyFilter"
          :options="companyFilterOptions"
          aria-label="Filtrar empresas"
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
        <div class="inline-flex items-center gap-2 text-left">
          <span class="min-w-[11ch] shrink-0 text-right font-medium tabular-nums text-gray-800 dark:text-gray-100">
            {{ row.documentNumber }}
          </span>
          <TableBadge
            v-if="row.documentType && row.documentType !== '-'"
            color="violet"
            badge-class="shrink-0"
          >
            {{ row.documentType }}
          </TableBadge>
        </div>
      </template>

      <template #cell-taxResponsibility="{ row }">
        <TableBadge
          v-if="row.taxResponsibility && row.taxResponsibility !== '-'"
          :color="isTaxResponsibilityNoAplica(row.taxResponsibility) ? 'neutral' : 'info'"
        >
          {{ formatTableText(row.taxResponsibility) }}
        </TableBadge>
        <span v-else class="text-gray-400 dark:text-gray-500">-</span>
      </template>

      <template #cell-businessNature="{ row }">
        <TableBadge
          v-if="row.businessNature && row.businessNature !== '-'"
          :color="getBusinessNatureBadgeColor(row.businessNature)"
        >
          {{ formatTableText(row.businessNature) }}
        </TableBadge>
        <span v-else class="text-gray-400 dark:text-gray-500">-</span>
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

    <div class="mt-8" :class="{ 'pointer-events-none opacity-60': isLoading }">
      <PaginationClassic
        :page="currentPage"
        :amount="amount"
        :total="totalCompanies"
        @change-page="handleChangePage"
      />
    </div>

    <ModalCreate
      :modal-open="createModalOpen"
      @close-modal="closeCreateModal"
      @created="handleCompanyCreated"
    />

    <ModalEdit
      :modal-open="editModalOpen"
      :company="editingCompany"
      @close-modal="handleCloseEditModal"
      @updated="handleCompanyUpdated"
      @status-updated="handleCompanyStatusUpdated"
    />

    <ModalPermissionRolUser
      :modal-open="permissionsModalOpen"
      :company-id="permissionsContext.companyId"
      :company-name="permissionsContext.companyName"
      :user="permissionsContext.user"
      @close-modal="handleClosePermissionsModal"
    />

    <ModalAssignUsers
      :modal-open="assignUsersModalOpen"
      :company-id="assignUsersContext.companyId"
      :company-name="assignUsersContext.companyName"
      @close-modal="handleCloseAssignUsersModal"
      @updated="handleAssignUsersUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
import type { Company, userCompany } from '~/core/company/types/company.types'
import { useCompanyStore } from '~/core/company/store/company.store'
import { useDocumentTypeStore } from '~/core/documentType/store/documentType.store'
import { useTaxResponsibilityStore } from '~/core/taxResponsibility/store/taxResponsibility.store'
import { useVatRegimeStore } from '~/core/vatRegime/store/vatRegime.store'
import { Button, ReloadButton } from '~/core/ui/buttons'
import { UiIcon } from '~/core/ui/icons'
import { FilterPills } from '~/core/ui/filters'
import { useModal } from '~/core/ui/modal'
import TableColumnToggle from '~/core/ui/dropdown/TableColumnToggle.vue'
import InputSearch from '~/core/ui/inputs/InputSearch.vue'
import PaginationClassic from '~/core/ui/pagination/PaginationClassic.vue'
import { TableBadge } from '~/core/ui/badge'
import { Tooltip } from '~/core/ui/Utooltip'
import { UTable, TableInitialLoader } from '~/core/ui/Tables'
import type { UTableRow } from '~/core/ui/Tables/utable.types'
import type { BadgeColor } from '~/core/ui/badge/badge.types'
import { useTableRefresh } from '~/shared/composables/use-table-refresh'
import { toTitleCase } from '~/shared/utils/format'
import { useVisibleTableColumns } from '~/shared/composables/use-visible-table-columns'
import { buildFilterPillOptions, filterItemsByPill } from '~/shared/utils/build-filter-pill-options'
import ModalCreate from '../modals/ModalCreate.vue'
import ModalEdit from '../modals/ModalEdit.vue'
import ModalPermissionRolUser from '../modals/ModalPermissionRolUser.vue'
import ModalAssignUsers from '../modals/ModalAssignUsers.vue'
import TableCompanyUsers from './TableCompanyUsers.vue'
import { useAuthStore } from '~/core/auth/store/auth.store'
import { useMunicipalityService } from '~/core/ubication/services/municipality.service'

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
const documentTypeStore = useDocumentTypeStore()
const taxResponsibilityStore = useTaxResponsibilityStore()
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
const appliedStateId = ref('')
const appliedMunicipalityId = ref('')
const currentPage = ref(1)
const amount = ref(10)
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

const normalizeCatalogLabel = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

const isNaturalBusinessNatureId = (businessNatureId: string) => {
  const nature = businessNatureStore.businessNatures.find((item) => item.id === businessNatureId)
  if (!nature) return false
  return normalizeCatalogLabel(nature.name).includes('persona natural')
}

const isJuridicaBusinessNatureId = (businessNatureId: string) => {
  const nature = businessNatureStore.businessNatures.find((item) => item.id === businessNatureId)
  if (!nature) return false
  return normalizeCatalogLabel(nature.name).includes('persona juridica')
}

const companyFilterOptions = computed(() =>
  buildFilterPillOptions<Company>({
    items: companyStore.companies,
    options: [
      { key: 'all', label: 'Todos' },
    ],
  }),
)

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
  await fetchCompanies(1, true)
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
  await fetchCompanies(1, true)
}

const filteredCompanies = computed(() =>
  filterItemsByPill(
    companyStore.companies,
    companyFilter.value,
    'all',
    {
      natural: (company) => isNaturalBusinessNatureId(company.businessNatureId),
      juridica: (company) => isJuridicaBusinessNatureId(company.businessNatureId),
      'with-api-key': (company) => company.hasApiKey,
      'without-api-key': (company) => !company.hasApiKey,
    },
  ),
)

const rows = computed<UTableRow[]>(() =>
  mapCompaniesToTableRows(filteredCompanies.value, {
    businessNatures: businessNatureStore.businessNatures,
    taxResponsibilities: taxResponsibilityStore.taxResponsibilities,
    documentTypes: documentTypeStore.documentTypes,
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

  return {
    amount: amount.value,
    page,
    ...(search ? { search } : {}),
    ...(stateId ? { stateId } : {}),
    ...(municipalityId ? { municipalityId } : {}),
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

const fetchCompanies = async (page: number, force = false) => {
  currentPage.value = page

  await withTableLoading(async () => {
    await catalogStore.preload(force)
    await companyStore.getCompanies(buildCompaniesRequestParams(page), force)
    selectedItems.value = []
    expandedUsersRowKey.value = null
  })
}

const handleCreateCompany = () => {
  openCreateModal()
}

const handleCompanyCreated = async () => {
  await fetchCompanies(currentPage.value, true)
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
  await fetchCompanies(currentPage.value, true)
}

const handleCompanyStatusUpdated = (active: boolean) => {
  if (!editingCompany.value) return

  editingCompany.value = {
    ...editingCompany.value,
    isActive: active,
  }
}

const handleCompanyUpdated = async () => {
  await fetchCompanies(currentPage.value, true)
}

const formatTableText = (value: unknown) => {
  if (typeof value !== 'string' || value === '-') return String(value ?? '')
  return toTitleCase(value)
}

const isTaxResponsibilityNoAplica = (value: unknown) => {
  if (typeof value !== 'string') return false
  return value.trim().toLowerCase() === 'no aplica'
}

const getBusinessNatureBadgeColor = (value: unknown): BadgeColor => {
  if (typeof value !== 'string') return 'neutral'

  const normalized = normalizeCatalogLabel(value)

  if (normalized.includes('persona natural')) return 'success'
  if (normalized.includes('persona juridica')) return 'warning'

  return 'neutral'
}

const handleChangePage = async (page: number) => {
  if (isLoading.value || page === currentPage.value) return
  await fetchCompanies(page)
}

const handleReload = async () => {
  if (isLoading.value) return
  await fetchCompanies(currentPage.value, true)
}

const handleSearch = async () => {
  if (isLoading.value) return
  await fetchCompanies(1, true)
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
        await fetchCompanies(1, true)
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
    await fetchCompanies(1, true)
  },
  { debounce: 400 },
)

onMounted(async () => {
  await fetchCompanies(currentPage.value)
})
</script>
