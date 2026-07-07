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
          <div class="w-full sm:w-64">
            <InputSearch
              v-model="searchQuery"
              placeholder="Buscar..."
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

    <div v-if="isLoading" class="flex min-h-72 items-center justify-center rounded-xl bg-white shadow-xs dark:bg-gray-800">
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
        Cargando empresas...
      </p>
    </div>

    <UTable
      v-else
      title="Todas las empresas"
      :count="totalCompanies"
      :columns="visibleColumns"
      :rows="rows"
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
    />

    <ModalPermissionRolUser
      :modal-open="permissionsModalOpen"
      :company-id="permissionsContext.companyId"
      :company-name="permissionsContext.companyName"
      :user="permissionsContext.user"
      @close-modal="handleClosePermissionsModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { watchDebounced } from '@vueuse/core'

import { useCatalogStore } from '~/core/catalog/store/catalog.store'
import { useBusinessNatureStore } from '~/core/businessNature/store/businessNature.store'
import {
  companyColumns,
  mapCompaniesToTableRows,
} from '~/core/company/mappers/company-table.mapper'
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
import UTable from '~/core/ui/Tables/Utable.vue'
import type { UTableRow } from '~/core/ui/Tables/utable.types'
import type { BadgeColor } from '~/core/ui/badge/badge.types'
import { toTitleCase } from '~/shared/utils/format'
import { useVisibleTableColumns } from '~/shared/composables/use-visible-table-columns'
import { buildFilterPillOptions, filterItemsByPill } from '~/shared/utils/build-filter-pill-options'
import ModalCreate from '../modals/ModalCreate.vue'
import ModalEdit from '../modals/ModalEdit.vue'
import ModalPermissionRolUser from '../modals/ModalPermissionRolUser.vue'
import TableCompanyUsers from './TableCompanyUsers.vue'

type PermissionsContext = {
  companyId: string
  companyName: string
  user: userCompany | null
}

const catalogStore = useCatalogStore()
const businessNatureStore = useBusinessNatureStore()
const companyStore = useCompanyStore()
const documentTypeStore = useDocumentTypeStore()
const taxResponsibilityStore = useTaxResponsibilityStore()
const vatRegimeStore = useVatRegimeStore()

const selectedItems = ref<Array<string | number>>([])
const searchQuery = ref('')
const companyFilter = ref('all')
const currentPage = ref(1)
const amount = ref(10)
const isLoading = ref(true)
const expandedUsersRowKey = ref<string | number | null>(null)

const {
  visibleKeys: visibleColumnKeys,
  visibleColumns,
  resetVisibleColumns,
} = useVisibleTableColumns(companyColumns, { storageKey: 'table-columns:companies' })

const { modalOpen: createModalOpen, open: openCreateModal, close: closeCreateModal } = useModal()
const { modalOpen: editModalOpen, open: openEditModal, close: closeEditModal } = useModal()
const { modalOpen: permissionsModalOpen, open: openPermissionsModal, close: closePermissionsModal } = useModal()
const editingCompany = ref<Company | null>(null)
const permissionsContext = ref<PermissionsContext>({
  companyId: '',
  companyName: '',
  user: null,
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
      {
        key: 'natural',
        label: 'Persona natural',
        match: (company) => isNaturalBusinessNatureId(company.businessNatureId),
      },
      {
        key: 'juridica',
        label: 'Persona jurídica',
        match: (company) => isJuridicaBusinessNatureId(company.businessNatureId),
      }
    ],
  }),
)

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

  return {
    amount: amount.value,
    page,
    ...(search ? { search } : {}),
  }
}

const fetchCompanies = async (page: number, force = false) => {
  isLoading.value = true
  currentPage.value = page

  try {
    await catalogStore.preload(force)
    await companyStore.getCompanies(buildCompaniesRequestParams(page), force)
    selectedItems.value = []
    expandedUsersRowKey.value = null
  } finally {
    isLoading.value = false
  }
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

const isInitialLoadDone = ref(false)

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
  isInitialLoadDone.value = true
})
</script>
