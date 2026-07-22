<template>
  <div class="w-full">
    <div
      class="flex flex-col"
      :class="viewMode === 'calendar' ? 'mb-3 gap-4' : 'mb-8 gap-6'"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <h1 class="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">
          Agendamientos
        </h1>

        <Button
          class="w-full sm:w-auto"
          variant="primary"
          aria-controls="create-demonstration-modal"
          @click.stop="emit('create')"
        >
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
          </template>
          Agendar Demostración
        </Button>
      </div>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <FilterCards
          v-model="statusFilter"
          :options="statusFilterOptions"
          aria-label="Filtrar por estado"
          wrapper-class="mb-0"
        />

        <div class="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <div class="w-full sm:w-64">
            <InputSearch
              v-model="searchQuery"
              placeholder="Buscar por nombre o correo..."
              search-label="Buscar"
            />
          </div>

          <DateSelect
            v-if="viewMode === 'table'"
            v-model="datePeriod"
          />

          <div
            class="flex flex-nowrap -space-x-px"
            role="group"
            aria-label="Cambiar vista"
          >
            <button
              type="button"
              class="btn rounded-none border-gray-200 bg-white first:rounded-l-lg last:rounded-r-lg dark:border-gray-700/60 dark:bg-gray-800"
              :class="viewMode === 'table'
                ? 'text-violet-500'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900'"
              @click="setViewMode('table')"
            >
              Tabla
            </button>
            <button
              type="button"
              class="btn rounded-none border-gray-200 bg-white first:rounded-l-lg last:rounded-r-lg dark:border-gray-700/60 dark:bg-gray-800"
              :class="viewMode === 'calendar'
                ? 'text-violet-500'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900'"
              @click="setViewMode('calendar')"
            >
              Calendario
            </button>
          </div>

          <TableColumnToggle
            v-if="viewMode === 'table'"
            v-model="visibleColumnKeys"
            :columns="demonstrationColumns"
            align="right"
            @reset="resetVisibleColumns"
          />

          <ReloadButton :loading="isLoading" @click="handleReload" />
        </div>
      </div>
    </div>

    <TableInitialLoader
      v-if="showInitialLoader"
      message="Cargando agendamientos..."
    />

    <template v-else-if="viewMode === 'calendar'">
      <div
        class="min-h-0"
        :class="{ 'pointer-events-none opacity-60': isLoading }"
      >
        <UCalendar
          fit-height
          body-max-height="calc(100dvh - 18rem)"
          :events="calendarEvents"
          :max-visible-events="1"
          :show-create-button="false"
          :show-add-filter-button="false"
          @event-click="handleCalendarEventClick"
        />
      </div>
    </template>

    <template v-else>
      <UTable
        title="Todos los agendamientos"
        :count="demonstrations.length"
        :columns="visibleColumns"
        :rows="demonstrations"
        :refreshing="isTableRefreshing"
        show-actions
        actions-mode="inline"
        actions-label="Acciones"
        :action-buttons="demonstrationTableActions"
        @action="handleRowAction"
      >
        <template #cell-scheduledTime="{ row }">
          <TableBadge
            v-if="hasScheduledTime(row.scheduledTime)"
            color="info"
          >
            {{ formatTableText(row.scheduledTime) }}
          </TableBadge>
          <span v-else class="text-gray-400 dark:text-gray-500">-</span>
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

        <template #cell-productInterest="{ row }">
          <div
            v-if="resolveProductInterest(row).length === 1"
            class="flex items-center justify-start"
          >
            <TableBadge color="info">
              {{ formatTableText(resolveProductInterest(row)[0]) }}
            </TableBadge>
          </div>
          <Tooltip
            v-else-if="resolveProductInterest(row).length > 1"
            bg="light"
            position="top"
          >
            <template #trigger>
              <button
                type="button"
                class="inline-flex items-center justify-start gap-1"
                :aria-label="`Ver productos de interés: ${resolveProductInterest(row).join(', ')}`"
              >
                <TableBadge color="info">
                  {{ formatTableText(resolveProductInterest(row)[0]) }}
                </TableBadge>
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  ...
                </span>
              </button>
            </template>
            <div class="space-y-1 px-0.5 py-0.5 text-xs font-medium">
              <p
                v-for="product in resolveProductInterest(row).slice(1)"
                :key="product"
                class="whitespace-nowrap"
              >
                {{ formatTableText(product) }}
              </p>
            </div>
          </Tooltip>
          <span v-else class="text-gray-400 dark:text-gray-500">-</span>
        </template>
      </UTable>

      <div class="mt-4" :class="{ 'pointer-events-none opacity-60': isLoading }">
        <PaginationClassic
          :page="currentPage"
          :amount="amount"
          :total="total"
          @change-page="handleChangePage"
          @change-amount="handleChangeAmount"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

import { TableBadge, UBadge } from '~/core/ui/badge'
import { Button, ReloadButton } from '~/core/ui/buttons'
import type { CalendarEvent } from '~/core/ui/calendar'
import { UCalendar } from '~/core/ui/calendar'
import TableColumnToggle from '~/core/ui/dropdown/TableColumnToggle.vue'
import { FilterCards } from '~/core/ui/filters'
import DateSelect from '~/core/ui/form/DateSelect.vue'
import { UiIcon } from '~/core/ui/icons'
import InputSearch from '~/core/ui/inputs/InputSearch.vue'
import PaginationClassic from '~/core/ui/pagination/PaginationClassic.vue'
import { UTable, TableInitialLoader } from '~/core/ui/Tables'
import type { UTableRow } from '~/core/ui/Tables/utable.types'
import { Tooltip } from '~/core/ui/utooltip'
import type { DatePeriodId } from '~/shared/constants/date-periods'
import { useCopyPhoneNumber } from '~/shared/composables/use-copy-phone-number'
import { useTableRefresh } from '~/shared/composables/use-table-refresh'
import { useVisibleTableColumns } from '~/shared/composables/use-visible-table-columns'
import { buildFilterPillOptions, filterItemsByPill } from '~/shared/utils/build-filter-pill-options'
import { filterItemsByDatePeriod } from '~/shared/utils/date-range-filter'
import { formatTableText } from '~/shared/utils/format'
import { demonstrationTableActions } from '../../mappers/demonstration-table.actions'
import {
  demonstrationColumns,
  mapDemonstrationsToCalendarEvents,
  mapDemonstrationsToTableRows,
} from '../../mappers/demonstration-tables-mappers'
import { useDemonstrationsStore } from '../../store/demonstrations.store'
import type { DemonstrationResponse } from '../../types/demonstration.types'
import { DemonstrationStatus } from '../../types/demonstration.types'

type DemonstrationsViewMode = 'table' | 'calendar'

const CALENDAR_PAGE_AMOUNT = 200
const TABLE_DEFAULT_AMOUNT = 10

const emit = defineEmits<{
  create: []
  edit: [id: string]
  delete: [payload: { id: string, name: string }]
}>()

const demonstrationsStore = useDemonstrationsStore()
const { isPhoneAnimating, isPhoneCopied, copyPhoneNumber } = useCopyPhoneNumber()
const searchQuery = ref('')
const debouncedSearch = refDebounced(searchQuery, 400)
const datePeriod = ref<DatePeriodId>(4)
const statusFilter = ref('all')
const viewMode = ref<DemonstrationsViewMode>('table')
const tableAmount = ref(TABLE_DEFAULT_AMOUNT)

const {
  isLoading,
  isTableRefreshing,
  showInitialLoader,
  withTableLoading,
} = useTableRefresh()

const hasPhoneNumber = (value: unknown) => {
  if (typeof value !== 'string') return false
  const phone = value.trim()
  return phone.length > 0 && phone !== '-'
}

const hasScheduledTime = (value: unknown) => {
  if (typeof value !== 'string') return false
  const time = value.trim()
  return time.length > 0 && time !== '-'
}

const resolveProductInterest = (row: UTableRow): string[] => {
  if (!Array.isArray(row.productInterest)) return []

  return row.productInterest
    .map((product) => String(product ?? '').trim())
    .filter(Boolean)
}

const {
  visibleKeys: visibleColumnKeys,
  visibleColumns,
  resetVisibleColumns,
} = useVisibleTableColumns(demonstrationColumns, { storageKey: 'table-columns:demonstrations' })

const statusMatchers: Record<string, (item: DemonstrationResponse) => boolean> = {
  [DemonstrationStatus.PENDIENTE]: (item) => item.status === DemonstrationStatus.PENDIENTE,
  [DemonstrationStatus.EJECUTADA]: (item) => item.status === DemonstrationStatus.EJECUTADA,
  [DemonstrationStatus.CANCELADA]: (item) => item.status === DemonstrationStatus.CANCELADA,
}

const filteredByStatus = computed(() =>
  filterItemsByPill(
    demonstrationsStore.demonstrations,
    statusFilter.value,
    'all',
    statusMatchers,
  ),
)

const demonstrationsByDate = computed(() =>
  filterItemsByDatePeriod(
    filteredByStatus.value,
    datePeriod.value,
    (demonstration) => demonstration.scheduledAt,
  ),
)

const statusFilterOptions = computed(() =>
  buildFilterPillOptions<DemonstrationResponse>({
    items: viewMode.value === 'calendar'
      ? filteredByStatus.value
      : demonstrationsByDate.value,
    options: [
      { key: 'all', label: 'Todos' },
      {
        key: DemonstrationStatus.PENDIENTE,
        label: 'Pendiente',
        match: (item) => item.status === DemonstrationStatus.PENDIENTE,
      },
      {
        key: DemonstrationStatus.EJECUTADA,
        label: 'Ejecutada',
        match: (item) => item.status === DemonstrationStatus.EJECUTADA,
      },
      {
        key: DemonstrationStatus.CANCELADA,
        label: 'Cancelada',
        match: (item) => item.status === DemonstrationStatus.CANCELADA,
      },
    ],
  }),
)

const demonstrations = computed(() =>
  mapDemonstrationsToTableRows(demonstrationsByDate.value),
)

const calendarEvents = computed(() =>
  mapDemonstrationsToCalendarEvents(filteredByStatus.value),
)

const total = computed(() => demonstrationsStore.total)
const currentPage = computed(() => demonstrationsStore.page)
const amount = computed(() => demonstrationsStore.amount)

const handleRowAction = ({ action, row }: { action: string, row: UTableRow }) => {
  if (row.id == null) return

  if (action === 'edit') {
    emit('edit', String(row.id))
    return
  }

  if (action === 'delete') {
    emit('delete', {
      id: String(row.id),
      name: String(row.name ?? ''),
    })
  }
}

const handleCalendarEventClick = (event: CalendarEvent) => {
  if (event.id == null) return
  emit('edit', String(event.id))
}

const fetchDemonstrations = async (page: number, nextAmount = amount.value) => {
  await withTableLoading(async () => {
    await demonstrationsStore.getDemonstrations({
      amount: nextAmount,
      page,
      search: debouncedSearch.value.trim() || undefined,
    })
  })
}

const setViewMode = async (mode: DemonstrationsViewMode) => {
  if (viewMode.value === mode || isLoading.value) return

  viewMode.value = mode

  if (mode === 'calendar') {
    await fetchDemonstrations(1, CALENDAR_PAGE_AMOUNT)
    return
  }

  await fetchDemonstrations(1, tableAmount.value)
}

const handleReload = async () => {
  if (isLoading.value) return

  searchQuery.value = ''
  statusFilter.value = 'all'
  datePeriod.value = 4

  const nextAmount = viewMode.value === 'calendar'
    ? CALENDAR_PAGE_AMOUNT
    : tableAmount.value

  await fetchDemonstrations(1, nextAmount)
}

const handleChangePage = async (page: number) => {
  if (isLoading.value || viewMode.value !== 'table') return
  await fetchDemonstrations(page, tableAmount.value)
}

const handleChangeAmount = async (nextAmount: number) => {
  if (isLoading.value || nextAmount === amount.value || viewMode.value !== 'table') return
  tableAmount.value = nextAmount
  await fetchDemonstrations(1, nextAmount)
}

watch(debouncedSearch, async () => {
  const nextAmount = viewMode.value === 'calendar'
    ? CALENDAR_PAGE_AMOUNT
    : tableAmount.value

  await fetchDemonstrations(1, nextAmount)
})

onMounted(async () => {
  tableAmount.value = amount.value || TABLE_DEFAULT_AMOUNT
  await fetchDemonstrations(currentPage.value, tableAmount.value)
})
</script>
