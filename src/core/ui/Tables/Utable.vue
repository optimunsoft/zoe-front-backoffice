<template>
  <div class="bg-white dark:bg-gray-800 shadow-xs rounded-xl overflow-hidden relative">
    <TableRefreshRibbon :active="refreshing" />

    <header v-if="title" class="relative px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
      <h2 class="font-semibold text-gray-800 dark:text-gray-100">
        {{ title }}
        <span v-if="count !== undefined" class="text-gray-400 dark:text-gray-500 font-medium">{{ count }}</span>
      </h2>
    </header>

    <div
      ref="scrollBodyRef"
      class="overflow-auto"
      :style="bodyScrollStyle"
    >
        <table class="table-auto w-full text-gray-800 dark:text-gray-100">
          <thead
            class="sticky top-0 z-10 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-t border-b border-gray-100 dark:border-gray-700/60 shadow-[inset_0_-1px_0_0_rgba(229,231,235,1)] dark:shadow-[inset_0_-1px_0_0_rgba(55,65,81,0.6)]"
            :class="{ 'utable-thead-dimmed': isAccordionFocused }"
          >
            <tr>
              <th v-if="selectable" class="px-2 first:pl-5 last:pr-5 py-1.5 whitespace-nowrap w-px text-center bg-gray-50 dark:bg-gray-900">
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
                class="px-2 first:pl-5 last:pr-5 py-1.5 whitespace-nowrap bg-gray-50 dark:bg-gray-900"
                :class="alignTextClass(resolveColumnAlign(column))"
              >
                <slot :name="`header-${column.key}`" :column="column">
                  <div
                    class="font-semibold"
                    :class="alignTextClass(resolveColumnAlign(column))"
                  >
                    {{ column.label }}
                  </div>
                </slot>
              </th>
              <th v-if="showActions" class="px-2 first:pl-5 last:pr-5 py-1.5 whitespace-nowrap text-left bg-gray-50 dark:bg-gray-900">
                <slot name="header-actions">
                  <div v-if="actionsLabel" class="font-semibold text-left">{{ actionsLabel }}</div>
                  <span v-else class="sr-only">Menú</span>
                </slot>
              </th>
            </tr>
          </thead>

          <tbody
            class="text-sm divide-y divide-gray-100 dark:divide-gray-700/60"
            :class="{ 'utable-accordion-active': isAccordionFocused }"
          >
            <template v-for="row in rows" :key="getRowKey(row)">
              <tr
                :data-row-key="getRowKey(row)"
                :class="getMainRowClass(row)"
              >
              <td v-if="selectable" class="px-2 first:pl-5 last:pr-5 py-1.5 whitespace-nowrap w-px text-center">
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
                class="px-2 first:pl-5 last:pr-5 py-1.5 whitespace-nowrap"
                :class="alignTextClass(resolveColumnAlign(column))"
              >
                <slot
                  :name="`cell-${column.key}`"
                  :row="row"
                  :column="column"
                  :value="row[column.key]"
                  :formatted="formatCellValue(row[column.key])"
                >
                  <!-- image-label -->
                  <div
                    v-if="column.type === 'image-label'"
                    class="flex items-center"
                    :class="alignFlexClass(resolveColumnAlign(column))"
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
                  <div
                    v-else-if="column.type === 'badge'"
                    class="flex"
                    :class="alignFlexClass(resolveColumnAlign(column))"
                  >
                    <TableBadge :color="resolveBadgeColor(row, column)">
                      {{ formatCellValue(row[column.key]) }}
                    </TableBadge>
                  </div>

                  <!-- icon-label -->
                  <div
                    v-else-if="column.type === 'icon-label'"
                    class="flex items-center"
                    :class="alignFlexClass(resolveColumnAlign(column))"
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
                    <div class="text-gray-800 dark:text-gray-100">{{ formatCellValue(row[column.key]) }}</div>
                  </div>

                  <!-- text (default) -->
                  <div
                    v-else
                    :class="[
                      alignTextClass(resolveColumnAlign(column)),
                      'text-gray-800 dark:text-gray-100',
                      cellTextClass(row, column),
                    ]"
                  >
                    {{ formatCellValue(row[column.key]) }}
                  </div>
                </slot>
              </td>

              <td v-if="showActions" class="px-2 first:pl-5 last:pr-5 py-1.5 whitespace-nowrap w-px text-left">
                <slot name="actions" :row="row">
                  <!-- inline: botones por fila -->
                  <div v-if="actionsMode === 'inline'" class="flex justify-start space-x-1">
                    <Tooltip
                      v-for="action in actionButtons"
                      :key="action.key"
                      bg="light"
                      position="top"
                    >
                      <template #trigger>
                        <button
                          type="button"
                          class="ui-icon-btn rounded-full transition-colors"
                          :class="isActionExpanded(action, row)
                            ? 'text-brand-500 dark:text-brand-400'
                            : action.tone === 'danger'
                              ? 'text-red-400 hover:text-red-500 dark:text-red-500/80 dark:hover:text-red-400'
                              : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'"
                          :aria-expanded="isActionExpanded(action, row) || undefined"
                          :aria-label="action.label"
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
                      </template>
                      <div class="whitespace-nowrap text-xs font-medium">
                        {{ action.tooltip || action.label }}
                      </div>
                    </Tooltip>
                  </div>

                  <!-- menu: ⋯ -->
                  <button
                    v-else
                    type="button"
                    class="ui-icon-btn text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-full"
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
                class="utable-row-detail-focused"
              >
                <td :colspan="columnCount" class="px-2 first:pl-5 last:pr-5 py-1.5">
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'

import { formatTableText } from '~/shared/utils/format'
import { TableBadge } from '~/core/ui/badge'
import type { BadgeColor } from '~/core/ui/badge/badge.types'
import { UiIcon, resolveUiIconName } from '~/core/ui/icons'
import { Tooltip } from '~/core/ui/utooltip'
import {
  UTABLE_BADGE_FALLBACK_CLASS,
  UTABLE_DEFAULT_VISIBLE_ROWS,
  UTABLE_TEXT_MAP_FALLBACK_CLASS,
} from './utable.types'
import {
  buildUtableMaxBodyHeightFallback,
  measureUtableMaxBodyHeight,
} from './utable-measure.utils'
import TableRefreshRibbon from './TableRefreshRibbon.vue'
import type {
  UTableActionButton,
  UTableColumn,
  UTableColumnAlign,
  UTableRow,
} from './utable.types'

export default {
  name: 'UTable',
  components: {
    TableBadge,
    TableRefreshRibbon,
    Tooltip,
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
    /** Muestra una cinta de carga en la cabecera mientras se refrescan los datos. */
    refreshing: {
      type: Boolean,
      default: false,
    },
    /** Efecto de foco/desenfoque al expandir filas con acordeón (`row-detail`). */
    accordionFocusEffect: {
      type: Boolean,
      default: true,
    },
    /**
     * Altura máxima del cuerpo de la tabla (CSS). Tiene prioridad sobre `visibleRows`.
     * Vacío = usa altura fija según `visibleRows`.
     */
    bodyMaxHeight: {
      type: String,
      default: '',
    },
    /**
     * Filas de datos visibles antes de activar scroll vertical.
     * Es el tope máximo: con menos filas la tabla se encoge; con más, aparece scroll.
     * `0` desactiva el límite.
     */
    visibleRows: {
      type: Number,
      default: UTABLE_DEFAULT_VISIBLE_ROWS,
    },
  },
  emits: ['change-selection', 'action'],
  setup(props, { emit }) {
    const slots = useSlots()
    const selectAll = ref(false)
    const selected = ref<Array<string | number>>([])
    const scrollBodyRef = ref<HTMLElement | null>(null)
    const measuredMaxBodyHeight = ref<number | null>(null)
    let resizeObserver: ResizeObserver | null = null

    const syncMeasuredBodyHeight = () => {
      if (props.bodyMaxHeight?.trim() || props.visibleRows <= 0) {
        measuredMaxBodyHeight.value = null
        return
      }

      const container = scrollBodyRef.value
      if (!container) return

      measuredMaxBodyHeight.value = measureUtableMaxBodyHeight(container, props.visibleRows)
    }

    const scheduleBodyHeightMeasure = () => {
      nextTick(() => {
        syncMeasuredBodyHeight()
      })
    }

    const bodyScrollStyle = computed(() => {
      const maxHeight = props.bodyMaxHeight?.trim()
      if (maxHeight) {
        return { maxHeight }
      }

      if (props.visibleRows > 0) {
        const maxHeight = measuredMaxBodyHeight.value != null
          ? `${measuredMaxBodyHeight.value}px`
          : buildUtableMaxBodyHeightFallback(props.visibleRows)

        return { maxHeight }
      }

      return undefined
    })

    const columnCount = computed(() => {
      let count = props.columns.length
      if (props.selectable) count += 1
      if (props.showActions) count += 1
      return count
    })

    const isAccordionFocused = computed(() =>
      props.accordionFocusEffect
      && props.expandedRowKey != null
      && Boolean(slots['row-detail']),
    )

    const getMainRowClass = (row: UTableRow) => {
      if (!isAccordionFocused.value) return ''

      const isExpanded = props.expandedRowKey != null && getRowKey(row) === props.expandedRowKey
      return isExpanded ? 'utable-row-focused' : 'utable-row-dimmed'
    }

    const scrollExpandedRowIntoView = () => {
      if (props.expandedRowKey == null) return

      nextTick(() => {
        const container = scrollBodyRef.value
        if (!container) return

        const expandedRow = container.querySelector<HTMLElement>(
          `[data-row-key="${props.expandedRowKey}"]`,
        )

        expandedRow?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      })
    }

    watch(() => props.expandedRowKey, (nextKey) => {
      if (nextKey == null) return
      scrollExpandedRowIntoView()
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
      scheduleBodyHeightMeasure()
    })

    watch(
      () => [
        props.visibleRows,
        props.columns.length,
        props.showActions,
        props.selectable,
        props.expandedRowKey,
        props.refreshing,
      ],
      scheduleBodyHeightMeasure,
    )

    onMounted(() => {
      scheduleBodyHeightMeasure()

      if (typeof ResizeObserver === 'undefined') return

      resizeObserver = new ResizeObserver(() => {
        syncMeasuredBodyHeight()
      })

      watch(scrollBodyRef, (element) => {
        resizeObserver?.disconnect()

        if (!element) return

        const table = element.querySelector('table')
        if (table) resizeObserver?.observe(table)
      }, { immediate: true })
    })

    onBeforeUnmount(() => {
      resizeObserver?.disconnect()
      resizeObserver = null
    })

    const formatCellValue = (value: unknown) => formatTableText(value)

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
      const formattedKey = formatTableText(key)

      if (column.badgeColorMap?.[key]) {
        return column.badgeColorMap[key]
      }

      if (formattedKey && column.badgeColorMap?.[formattedKey]) {
        return column.badgeColorMap[formattedKey]
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

    const resolveColumnAlign = (column: UTableColumn): UTableColumnAlign =>
      column.headerAlign ?? column.align ?? 'left'

    const alignTextClass = (align: UTableColumnAlign) => {
      if (align === 'center') return 'text-center'
      if (align === 'right') return 'text-right'
      return 'text-left'
    }

    const alignFlexClass = (align: UTableColumnAlign) => {
      if (align === 'center') return 'justify-center'
      if (align === 'right') return 'justify-end'
      return 'justify-start'
    }

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
      scrollBodyRef,
      columnCount,
      bodyScrollStyle,
      isAccordionFocused,
      getMainRowClass,
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
      resolveColumnAlign,
      alignTextClass,
      alignFlexClass,
      isRowExpanded,
      isActionExpanded,
      emitAction,
    }
  },
}
</script>

<style scoped>
.utable-thead-dimmed {
  opacity: 0.35;
  filter: blur(1px);
  transition: opacity 200ms ease, filter 200ms ease;
}

.utable-row-dimmed {
  opacity: 0.35;
  filter: blur(1.5px);
  transition: opacity 200ms ease, filter 200ms ease;
  pointer-events: none;
}

.utable-row-focused {
  position: relative;
  z-index: 20;
}

.utable-row-focused :deep(td) {
  background-color: rgb(255 255 255);
  box-shadow:
    0 -1px 0 0 rgb(229 231 235),
    0 8px 16px -6px rgb(0 0 0 / 0.12);
}

:global(.dark) .utable-row-focused :deep(td) {
  background-color: rgb(31 41 55);
  box-shadow:
    0 -1px 0 0 rgb(55 65 81 / 0.6),
    0 8px 16px -6px rgb(0 0 0 / 0.35);
}

.utable-row-detail-focused {
  position: relative;
  z-index: 20;
}

.utable-row-detail-focused :deep(td) {
  background-color: rgb(255 255 255);
  box-shadow: 0 14px 24px -8px rgb(0 0 0 / 0.14);
}

:global(.dark) .utable-row-detail-focused :deep(td) {
  background-color: rgb(31 41 55);
  box-shadow: 0 14px 24px -8px rgb(0 0 0 / 0.4);
}
</style>
