<template>
  <div class="w-full max-w-[96rem] mx-auto">
    <div class="sm:flex sm:justify-between sm:items-center mb-8">
      <div class="mb-4 sm:mb-0">
        <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Empresas
        </h1>
      </div>

      <div class="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
        <Button
          variant="danger-outline"
          :disabled="selectedItems.length === 0"
          @click="handleDeleteSelected"
        >
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
            </svg>
          </template>
          Eliminar
        </Button>

        <DateSelect />
        <FilterButton align="right" />

        <Button
          variant="primary"
          aria-controls="new-company-modal"
          @click="handleCreateCompany"
        >
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
          </template>
          Nueva empresa
        </Button>
      </div>
    </div>

    <UTable
      title="Todas las empresas"
      :count="rows.length"
      :columns="companyColumns"
      :rows="rows"
      show-actions
      actions-mode="inline"
      actions-label="Acciones"
      :action-buttons="actionButtons"
      @action="handleRowAction"
    >
      <template #cell-documentNumber="{ row }">
        <div class="flex flex-col items-start gap-1">
          <span class="font-medium text-gray-800 dark:text-gray-100">
            {{ row.documentNumber }}
          </span>
          <UBadge
            v-if="row.documentType && row.documentType !== '-'"
            color="violet"
            appearance="soft"
            size="xs"
          >
            {{ row.documentType }}
          </UBadge>
        </div>
      </template>
    </UTable>

    <div class="mt-8">
      <PaginationClassic
        :page="currentPage"
        :amount="amount"
        :total="totalCompanies"
        @change-page="handleChangePage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useBusinessNatureStore } from '~/core/businessNature/store/businessNature.store'
import {
  companyColumns,
  mapCompaniesToTableRows,
  type CompanyCatalogItem,
} from '~/core/company/mappers/company-table.mapper'
import { useCompanyStore } from '~/core/company/store/company.store'
import { useDocumentTypeStore } from '~/core/documentType/store/documentType.store'
import { useTaxResponsibilityStore } from '~/core/taxResponsibility/store/taxResponsibility.store'
import { useUbicationStore } from '~/core/ubication/store/ubication.store'
import { Button } from '~/core/ui/buttons'
import FilterButton from '~/core/ui/dropdown/DropdownFilter.vue'
import DateSelect from '~/core/ui/form/DateSelect.vue'
import PaginationClassic from '~/core/ui/pagination/PaginationClassic.vue'
import UBadge from '~/core/ui/badge/UBadge.vue'
import UTable from '~/core/ui/Tables/Utable.vue'
import type { UTableActionButton, UTableRow } from '~/core/ui/Tables/utable.types'

const businessNatureStore = useBusinessNatureStore()
const companyStore = useCompanyStore()
const documentTypeStore = useDocumentTypeStore()
const taxResponsibilityStore = useTaxResponsibilityStore()
const ubicationStore = useUbicationStore()

const selectedItems = ref<Array<string | number>>([])
const currentPage = ref(1)
const amount = ref(10)
const isLoading = ref(false)
const municipalitiesById = ref<Record<string, CompanyCatalogItem>>({})

const totalCompanies = computed(() => companyStore.total)

const municipalityItems = computed(() => Object.values(municipalitiesById.value))

const rows = computed<UTableRow[]>(() =>
  mapCompaniesToTableRows(companyStore.companies, {
    businessNatures: businessNatureStore.businessNatures,
    taxResponsibilities: taxResponsibilityStore.taxResponsibilities,
    documentTypes: documentTypeStore.documentTypes,
    municipalities: municipalityItems.value,
  }),
)

const actionButtons: UTableActionButton[] = [
  { key: 'edit', label: 'Editar' },
  { key: 'delete', label: 'Eliminar', tone: 'danger' },
]

const fetchCatalogs = async () => {
  await Promise.all([
    businessNatureStore.getBusinessNatures(),
    documentTypeStore.getDocumentTypes(),
    taxResponsibilityStore.getTaxResponsibilities(),
  ])
}

const fetchMunicipalityNames = async () => {
  const municipalityIds = [
    ...new Set(companyStore.companies.map((company) => company.municipalityId).filter(Boolean)),
  ]

  await Promise.all(
    municipalityIds.map(async (id) => {
      if (municipalitiesById.value[id]) return

      await ubicationStore.getMunicipalities({ id })
      const municipality = ubicationStore.municipalities.find((item) => item.id === id)

      if (municipality) {
        municipalitiesById.value[id] = {
          id: municipality.id,
          name: `${municipality.name} - ${municipality.state.name}`,
        }
      }
    }),
  )
}

const fetchCompanies = async (page: number) => {
  isLoading.value = true
  currentPage.value = page

  try {
    await companyStore.getCompanies({
      amount: amount.value,
      page,
    })
    await fetchMunicipalityNames()
    selectedItems.value = []
  } finally {
    isLoading.value = false
  }
}

const handleCreateCompany = () => {
  // TODO: abrir modal o navegar al formulario de creación
  console.log('create company')
}

const handleDeleteSelected = () => {
  // TODO: conectar con API
  console.log('delete', selectedItems.value)
}

const handleRowAction = ({ action, row }: { action: string, row: UTableRow }) => {
  // TODO: conectar con API / navegación
  console.log(action, row.id)
}

const handleChangePage = async (page: number) => {
  if (isLoading.value || page === currentPage.value) return
  await fetchCompanies(page)
}

onMounted(async () => {
  await fetchCatalogs()
  await fetchCompanies(currentPage.value)
})
</script>
