<template>
<div class="w-full">
    <div class="mb-8 flex flex-col gap-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
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
            <FilterPills
                v-model="statusFilter"
                :options="statusFilterOptions"
                aria-label="Filtrar por estado"
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
                <DateSelect v-model="datePeriod" />
                <TableColumnToggle
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

    <UTable
        v-else
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
                color="primary"
                appearance="soft"
                size="md"
                badge-class="cursor-pointer"
                :aria-label="`Copiar teléfono ${row.phone}`"
                @click.stop="copyPhoneNumber(String(row.phone))"
            >
                <UiIcon
                    name="copy"
                    size="sm"
                    class="shrink-0"
                />
                {{ row.phone }}
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
</div>
</template>


<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

import PaginationClassic from '~/core/ui/pagination/PaginationClassic.vue'
import { Button, ReloadButton } from '~/core/ui/buttons'
import { TableBadge, UBadge } from '~/core/ui/badge'
import { UiIcon } from '~/core/ui/icons'
import DateSelect from '~/core/ui/form/DateSelect.vue'
import TableColumnToggle from '~/core/ui/dropdown/TableColumnToggle.vue'
import { FilterPills } from '~/core/ui/filters'
import InputSearch from '~/core/ui/inputs/InputSearch.vue'
import { UTable, TableInitialLoader } from '~/core/ui/Tables'
import type { UTableRow } from '~/core/ui/Tables/utable.types'
import { useToast } from '~/core/ui/toast'
import { formatTableText } from '~/shared/utils/format'
import { Tooltip } from '~/core/ui/utooltip'
import { useTableRefresh } from '~/shared/composables/use-table-refresh'
import type { DatePeriodId } from '~/shared/constants/date-periods'
import { useVisibleTableColumns } from '~/shared/composables/use-visible-table-columns'
import { buildFilterPillOptions, filterItemsByPill } from '~/shared/utils/build-filter-pill-options'
import { filterItemsByDatePeriod } from '~/shared/utils/date-range-filter'
import {
    demonstrationColumns,
    mapDemonstrationsToTableRows,
} from '../../mappers/demonstration-tables-mappers'
import { demonstrationTableActions } from '../../mappers/demonstration-table.actions'
import type { DemonstrationResponse } from '../../types/demonstration.types'
import { DemonstrationStatus } from '../../types/demonstration.types'
import { useDemonstrationsStore } from '../../store/demonstrations.store'

const emit = defineEmits<{
  create: []
  edit: [id: string]
  delete: [payload: { id: string, name: string }]
}>()

const demonstrationsStore = useDemonstrationsStore()
const toast = useToast()
const searchQuery = ref('')
const debouncedSearch = refDebounced(searchQuery, 400)
const datePeriod = ref<DatePeriodId>(4)
const statusFilter = ref('all')
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

const copyPhoneNumber = async (phone: string) => {
    const normalized = phone.trim()
    if (!normalized) return

    try {
        await navigator.clipboard.writeText(normalized)
        toast.success('Teléfono copiado')
    } catch {
        toast.error('No se pudo copiar el teléfono')
    }
}

const {
    visibleKeys: visibleColumnKeys,
    visibleColumns,
    resetVisibleColumns,
} = useVisibleTableColumns(demonstrationColumns, { storageKey: 'table-columns:demonstrations' })

const demonstrationsByDate = computed(() =>
    filterItemsByDatePeriod(
        demonstrationsStore.demonstrations,
        datePeriod.value,
        (demonstration) => demonstration.scheduledAt,
    ),
)

const statusFilterOptions = computed(() =>
    buildFilterPillOptions<DemonstrationResponse>({
        items: demonstrationsByDate.value,
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

const demonstrations = computed(() => {
    const byStatus = filterItemsByPill(
        demonstrationsByDate.value,
        statusFilter.value,
        'all',
        {
            [DemonstrationStatus.PENDIENTE]: (item) => item.status === DemonstrationStatus.PENDIENTE,
            [DemonstrationStatus.EJECUTADA]: (item) => item.status === DemonstrationStatus.EJECUTADA,
            [DemonstrationStatus.CANCELADA]: (item) => item.status === DemonstrationStatus.CANCELADA,
        },
    )

    return mapDemonstrationsToTableRows(byStatus)
})

const total = computed(() => demonstrationsStore.total)

const currentPage = computed(() => demonstrationsStore.page)

const amount = computed(() => demonstrationsStore.amount)

const handleRowAction = async ({ action, row }: { action: string, row: UTableRow }) => {
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

const fetchDemonstrations = async (page: number) => {
    await withTableLoading(async () => {
        await demonstrationsStore.getDemonstrations({
            amount: amount.value,
            page,
            search: debouncedSearch.value.trim() || undefined,
        })
    })
}

const handleReload = async () => {
    if (isLoading.value) return
    await fetchDemonstrations(currentPage.value)
}

const handleChangePage = async (page: number) => {
    if (isLoading.value) return
    await fetchDemonstrations(page)
}

const handleChangeAmount = async (nextAmount: number) => {
    if (isLoading.value || nextAmount === amount.value) return
    await withTableLoading(async () => {
        await demonstrationsStore.getDemonstrations({
            amount: nextAmount,
            page: 1,
            search: debouncedSearch.value.trim() || undefined,
        })
    })
}

watch(debouncedSearch, async () => {
    await fetchDemonstrations(1)
})

onMounted(async () => {
    await fetchDemonstrations(currentPage.value)
})
</script>