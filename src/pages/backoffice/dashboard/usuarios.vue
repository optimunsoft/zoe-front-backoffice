<template>
  <div class="px-4 sm:px-6 lg:px-8 pt-12 pb-8 w-full max-w-[96rem] mx-auto">
    <div class="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
        Usuarios
      </h1>

      <div class="flex w-full flex-col gap-5 sm:w-auto sm:items-end">
        <Button
          class="w-full sm:w-auto"
          variant="primary"
          aria-controls="new-user-modal"
          @click="handleCreateUser"
        >
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
          </template>
          Nuevo usuario
        </Button>

        <div class="flex w-full flex-wrap items-center justify-end gap-2 sm:gap-3">
          <div class="w-full sm:w-64">
            <InputSearch
              v-model="searchQuery"
              placeholder="Buscar..."
              search-label="Buscar"
            />
          </div>
          <DateSelect v-model="datePeriod" />
          <FilterButton align="right" />
        </div>
      </div>
    </div>

    <UTable
      title="Todos los usuarios"
      :count="users.length"
      :columns="columns"
      :rows="users"
      show-actions
      actions-mode="inline"
      actions-label="Acciones"
      :action-buttons="actionButtons"
      @action="handleRowAction"
    />

    <div class="mt-8">
      <PaginationClassic
        :page="currentPage"
        :amount="amount"
        :total="usersStore.total as number"
        @change-page="handleChangePage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { Button } from '~/core/ui/buttons'
import FilterButton from '~/core/ui/dropdown/DropdownFilter.vue'
import DateSelect from '~/core/ui/form/DateSelect.vue'
import InputSearch from '~/core/ui/inputs/InputSearch.vue'
import PaginationClassic from '~/core/ui/pagination/PaginationClassic.vue'
import UTable from '~/core/ui/Tables/Utable.vue'
import type { UTableActionButton, UTableColumn, UTableRow } from '~/core/ui/Tables/utable.types'
import { useUsersStore } from '~/modules/administration/users/store/users.store'
import { mapUsersToTableRows, userColumns } from '~/modules/administration/users/mappers/user-tables-mappers'
import { filterTableRows } from '~/shared/utils/filter-table-rows'
import { DATE_PERIOD_DEFAULT } from '~/shared/constants/date-periods'
import type { DatePeriodId } from '~/shared/constants/date-periods'
import { filterItemsByDatePeriod } from '~/shared/utils/date-range-filter'

const usersStore = useUsersStore()
const selectedItems = ref<Array<string | number>>([])
const searchQuery = ref('')
const datePeriod = ref<DatePeriodId>(DATE_PERIOD_DEFAULT)
const currentPage = ref(1)
const amount = ref(10)
const isLoading = ref(false)

const columns = computed<UTableColumn[]>(() => userColumns)
const users = computed(() => {
  const source = usersStore.users
  const byDate = filterItemsByDatePeriod(
    source,
    datePeriod.value,
    (user) => user.createdAt,
  )

  return filterTableRows(
    mapUsersToTableRows(byDate),
    searchQuery.value,
  )
})

const actionButtons: UTableActionButton[] = [
  { key: 'edit', label: 'Editar' },
  { key: 'delete', label: 'Eliminar', tone: 'danger' },
]

const fetchUsers = async (page: number) => {
  isLoading.value = true
  currentPage.value = page

  try {
    await usersStore.getUsers({
      amount: amount.value,
      page,
    })
    selectedItems.value = []
  } finally {
    isLoading.value = false
  }
}

const handleCreateUser = () => {
  // TODO: abrir modal o navegar al formulario de creación
  console.log('create user')
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
  await fetchUsers(page)
}

onMounted(() => {
  fetchUsers(currentPage.value)
})
</script>
