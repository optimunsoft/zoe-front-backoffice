<template>
  <div class="bg-white dark:bg-gray-800 shadow-xs rounded-xl overflow-hidden relative">
    <header v-if="title" class="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
      <h2 class="font-semibold text-gray-800 dark:text-gray-100">
        {{ title }}
        <span v-if="count !== undefined" class="text-gray-400 dark:text-gray-500 font-medium">{{ count }}</span>
      </h2>
    </header>

    <div class="overflow-x-auto">
        <table class="table-auto w-full text-gray-600 dark:text-gray-300">
          <thead class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-t border-b border-gray-100 dark:border-gray-700/60">
            <tr>
              <th v-if="selectable" class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px text-center">
                <div class="flex items-center justify-center">
                  <label class="inline-flex">
                    <span class="sr-only">Seleccionar todo</span>
                    <input v-model="selectAll" class="form-checkbox" type="checkbox" @click="toggleSelectAll">
                  </label>
                </div>
              </th>
              <th
                v-for="column in columns"
                :key="column.key"
                class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-left"
              >
                <slot :name="`header-${column.key}`" :column="column">
                  <div class="font-semibold text-left">
                    {{ column.label }}
                  </div>
                </slot>
              </th>
              <th v-if="showActions" class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-left">
                <slot name="header-actions">
                  <div v-if="actionsLabel" class="font-semibold text-left">{{ actionsLabel }}</div>
                  <span v-else class="sr-only">Menú</span>
                </slot>
              </th>
            </tr>
          </thead>

          <tbody class="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
            <template v-for="row in rows" :key="getRowKey(row)">
              <tr>
              <td v-if="selectable" class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px text-center">
                <div class="flex items-center justify-center">
                  <label class="inline-flex">
                    <span class="sr-only">Seleccionar</span>
                    <input
                      class="form-checkbox"
                      type="checkbox"
                      :value="getRowKey(row)"
                      :checked="isRowSelected(row)"
                      @change="toggleRow(row)"
                    >
                  </label>
                </div>
              </td>

              <td
                v-for="column in columns"
                :key="column.key"
                class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-left"
              >
                <slot :name="`cell-${column.key}`" :row="row" :column="column" :value="row[column.key]">
                  <!-- image-label -->
                  <div
                    v-if="column.type === 'image-label'"
                    class="flex items-center justify-start"
                  >
                    <div class="w-10 h-10 shrink-0 mr-2 sm:mr-3">
                      <img
                        v-if="getCellImage(row, column)"
                        class="rounded-full"
                        :src="getCellImage(row, column)"
                        width="40"
                        height="40"
                        :alt="formatCellValue(row[column.key])"
                      >
                    </div>
                    <div class="font-medium text-gray-800 dark:text-gray-100">
                      {{ formatCellValue(row[column.key]) }}
                    </div>
                  </div>

                  <!-- badge -->
                  <TableBadge
                    v-else-if="column.type === 'badge'"
                    :color="resolveBadgeColor(row, column)"
                  >
                    {{ formatCellValue(row[column.key]) }}
                  </TableBadge>

                  <!-- icon-label -->
                  <div
                    v-else-if="column.type === 'icon-label'"
                    class="flex items-center justify-start"
                  >
                    <svg
                      class="fill-current text-gray-400 dark:text-gray-500 shrink-0 mr-2"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                    >
                      <path
                        v-for="(path, index) in getIconPaths(row, column)"
                        :key="index"
                        :d="path"
                      />
                    </svg>
                    <div>{{ formatCellValue(row[column.key]) }}</div>
                  </div>

                  <!-- text (default) -->
                  <div
                    v-else
                    :class="[
                      'text-left',
                      cellTextClass(row, column),
                    ]"
                  >
                    {{ formatCellValue(row[column.key]) }}
                  </div>
                </slot>
              </td>

              <td v-if="showActions" class="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px text-left">
                <slot name="actions" :row="row">
                  <!-- inline: botones por fila -->
                  <div v-if="actionsMode === 'inline'" class="flex justify-start space-x-1">
                    <button
                      v-for="action in actionButtons"
                      :key="action.key"
                      type="button"
                      class="rounded-full transition-colors"
                      :class="isActionExpanded(action, row)
                        ? 'text-brand-500 dark:text-brand-400'
                        : action.tone === 'danger'
                          ? 'text-red-400 hover:text-red-500 dark:text-red-500/80 dark:hover:text-red-400'
                          : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'"
                      :aria-expanded="isActionExpanded(action, row) || undefined"
                      @click.stop="emitAction(action.key, row)"
                    >
                      <span class="sr-only">{{ action.label }}</span>
                      <UiIcon
                        v-if="resolveActionIconName(action)"
                        :name="resolveActionIconName(action)!"
                        size="lg"
                      />
                      <svg
                        v-else-if="action.iconPaths?.length"
                        class="w-8 h-8 fill-current"
                        viewBox="0 0 32 32"
                        aria-hidden="true"
                      >
                        <path
                          v-for="(path, index) in action.iconPaths"
                          :key="index"
                          :d="path"
                        />
                      </svg>
                    </button>
                  </div>

                  <!-- menu: ⋯ -->
                  <button
                    v-else
                    type="button"
                    class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-full"
                  >
                    <span class="sr-only">Menú</span>
                    <svg class="w-8 h-8 fill-current" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="2" />
                      <circle cx="10" cy="16" r="2" />
                      <circle cx="22" cy="16" r="2" />
                    </svg>
                  </button>
                </slot>
              </td>
              </tr>

              <tr
                v-if="isRowExpanded(row) && $slots['row-detail']"
                :id="`row-detail-${getRowKey(row)}`"
                role="region"
              >
                <td :colspan="columnCount" class="px-2 first:pl-5 last:pr-5 py-3">
                  <slot name="row-detail" :row="row" />
                </td>
              </tr>
            </template>

            <tr v-if="rows.length === 0">
              <td :colspan="columnCount" class="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                {{ emptyText }}
              </td>
            </tr>
          </tbody>
        </table>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ref, watch } from 'vue'

import { toTitleCase } from '~/shared/utils/format'
import { TableBadge } from '~/core/ui/badge'
import type { BadgeColor } from '~/core/ui/badge/badge.types'
import { UiIcon, resolveUiIconName } from '~/core/ui/icons'
import {
  UTABLE_BADGE_FALLBACK_CLASS,
  UTABLE_TEXT_MAP_FALLBACK_CLASS,
} from './utable.types'
import type {
  UTableActionButton,
  UTableColumn,
  UTableRow,
} from './utable.types'

export default {
  name: 'UTable',
  components: {
    TableBadge,
    UiIcon,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    count: {
      type: [String, Number],
      default: undefined,
    },
    columns: {
      type: Array as () => UTableColumn[],
      required: true,
    },
    rows: {
      type: Array as () => UTableRow[],
      default: () => [],
    },
    rowKey: {
      type: String,
      default: 'id',
    },
    selectable: {
      type: Boolean,
      default: false,
    },
    showActions: {
      type: Boolean,
      default: false,
    },
    /** `menu` = ⋯. `inline` = botones múltiples por fila. */
    actionsMode: {
      type: String as () => 'menu' | 'inline',
      default: 'menu',
    },
    /** Texto visible en el header de la columna de acciones (opcional). */
    actionsLabel: {
      type: String,
      default: '',
    },
    /** Botones cuando `actionsMode="inline"`. */
    actionButtons: {
      type: Array as () => UTableActionButton[],
      default: () => [],
    },
    emptyText: {
      type: String,
      default: 'No hay registros',
    },
    /** Fila expandida (acordeón). Comparar con `rowKey` / `id`. */
    expandedRowKey: {
      type: [String, Number] as () => string | number | null,
      default: null,
    },
    /** Resalta la acción que abrió el acordeón (ej. `users`). */
    expandedActionKey: {
      type: String,
      default: '',
    },
  },
  emits: ['change-selection', 'action'],
  setup(props, { emit }) {
    const selectAll = ref(false)
    const selected = ref<Array<string | number>>([])

    const columnCount = computed(() => {
      let count = props.columns.length
      if (props.selectable) count += 1
      if (props.showActions) count += 1
      return count
    })

    const getRowKey = (row: UTableRow) => {
      const key = row[props.rowKey]
      return (key ?? row.id) as string | number
    }

    const isRowSelected = (row: UTableRow) => selected.value.includes(getRowKey(row))

    const toggleRow = (row: UTableRow) => {
      const key = getRowKey(row)
      const index = selected.value.indexOf(key)
      if (index === -1) selected.value.push(key)
      else selected.value.splice(index, 1)
    }

    const toggleSelectAll = () => {
      selected.value = []
      if (!selectAll.value) {
        selected.value = props.rows.map(getRowKey)
      }
    }

    watch(selected, () => {
      selectAll.value = props.rows.length > 0 && selected.value.length === props.rows.length
      emit('change-selection', [...selected.value])
    }, { deep: true })

    watch(() => props.rows, () => {
      selected.value = []
      selectAll.value = false
    })

    const formatCellValue = (value: unknown) => {
      if (typeof value !== 'string') return String(value ?? '')
      if (value === '-') return value
      return toTitleCase(value)
    }

    const cellVariantClass = (variant?: UTableColumn['variant']) => {
      if (variant === 'link') return 'font-medium text-sky-600'
      if (variant === 'success') return 'font-medium text-green-600'
      if (variant === 'warning') return 'font-medium text-amber-600'
      if (variant === 'danger') return 'font-medium text-red-600'
      if (variant === 'emphasis') return 'font-medium text-gray-800 dark:text-gray-100'
      return ''
    }

    const resolveVariant = (row: UTableRow, column: UTableColumn) => {
      if (column.variantKey) {
        return row[column.variantKey] as UTableColumn['variant']
      }
      return column.variant
    }

    const resolveMapKey = (row: UTableRow, column: UTableColumn) => {
      const refKey = column.classMapKey ?? column.key
      return row[refKey]
    }

    const resolveBadgeColor = (row: UTableRow, column: UTableColumn): BadgeColor => {
      const mapKey = resolveMapKey(row, column)
      const key = String(mapKey ?? row[column.key] ?? '')

      if (column.badgeColorMap?.[key]) {
        return column.badgeColorMap[key]
      }

      return column.badgeColorFallback ?? 'neutral'
    }

    const resolveCellClass = (row: UTableRow, column: UTableColumn) => {
      const mapKey = resolveMapKey(row, column)
      const key = String(mapKey ?? row[column.key] ?? '')
      const fallback = column.classMapFallback
        ?? (column.type === 'badge' ? UTABLE_BADGE_FALLBACK_CLASS : '')

      return column.classMap?.[key] ?? fallback
    }

    const cellTextClass = (row: UTableRow, column: UTableColumn) => {
      if (column.classMap) {
        const mapKey = resolveMapKey(row, column)
        const key = String(mapKey ?? '')
        const mapped = column.classMap[key]
        if (mapped) return `font-medium ${mapped}`
        if (column.classMapKey) {
          return `font-medium ${column.classMapFallback ?? UTABLE_TEXT_MAP_FALLBACK_CLASS}`
        }
      }
      return cellVariantClass(resolveVariant(row, column))
    }

    const getCellImage = (row: UTableRow, column: UTableColumn) => {
      if (!column.imageKey) return ''
      return String(row[column.imageKey] ?? '')
    }

    const getIconPaths = (row: UTableRow, column: UTableColumn) => {
      const value = String(row[column.key] ?? '')
      return column.iconMap?.[value] ?? column.iconMap?.default ?? []
    }

    const resolveActionIconName = (action: UTableActionButton) =>
      resolveUiIconName(action.icon, action.key)

    const isRowExpanded = (row: UTableRow) =>
      props.expandedRowKey != null && getRowKey(row) === props.expandedRowKey

    const isActionExpanded = (action: UTableActionButton, row: UTableRow) =>
      isRowExpanded(row)
      && props.expandedActionKey !== ''
      && action.key === props.expandedActionKey

    const emitAction = (actionKey: string, row: UTableRow) => {
      emit('action', { action: actionKey, row })
    }

    return {
      selectAll,
      selected,
      columnCount,
      getRowKey,
      isRowSelected,
      toggleRow,
      toggleSelectAll,
      formatCellValue,
      resolveBadgeColor,
      resolveCellClass,
      cellTextClass,
      getCellImage,
      getIconPaths,
      resolveActionIconName,
      isRowExpanded,
      isActionExpanded,
      emitAction,
    }
  },
}
</script>
