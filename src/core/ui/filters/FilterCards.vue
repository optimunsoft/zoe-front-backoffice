<template>
  <div :class="wrapperClass">
    <ul
      class="flex flex-wrap -m-1"
      role="listbox"
      :aria-label="ariaLabel"
    >
      <li
        v-for="option in options"
        :key="option.key"
        class="m-1"
        role="presentation"
      >
        <button
          type="button"
          role="option"
          :aria-selected="isSelected(option.key)"
          class="inline-flex min-w-[6.5rem] flex-col gap-1 rounded-xl border px-3 py-2 text-left shadow-xs transition"
          :class="isSelected(option.key) ? activeClass : inactiveClass"
          @click="selectOption(option.key)"
        >
          <span
            class="text-sm font-semibold leading-tight"
            :class="isSelected(option.key)
              ? 'text-gray-700 dark:text-gray-200'
              : 'text-gray-600 dark:text-gray-300'"
          >
            {{ option.label }}
          </span>

          <div class="flex items-baseline gap-1.5">
            <span
              class="text-[11px] font-medium uppercase tracking-wide"
              :class="isSelected(option.key)
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-gray-500 dark:text-gray-400'"
            >
              Totales
            </span>
            <span
              class="text-base font-bold tabular-nums leading-none"
              :class="isSelected(option.key)
                ? 'text-gray-800 dark:text-gray-100'
                : 'text-gray-600 dark:text-gray-300'"
            >
              {{ formatCount(option.count) }}
            </span>
          </div>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { FilterCardOption } from './filter-cards.types'

withDefaults(defineProps<{
  options: FilterCardOption[]
  ariaLabel?: string
  wrapperClass?: string
  activeClass?: string
  inactiveClass?: string
}>(), {
  ariaLabel: 'Filtros',
  wrapperClass: 'mb-4 sm:mb-0',
  activeClass: 'border-brand-500 bg-brand-500/10 dark:border-brand-400 dark:bg-brand-500/15 ring-1 ring-brand-500/25',
  inactiveClass: 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600',
})

const emit = defineEmits<{
  change: [key: string]
}>()

const model = defineModel<string>({ required: true })

const isSelected = (key: string) => model.value === key

const formatCount = (count?: number) => {
  if (count == null || Number.isNaN(count)) return '—'
  return new Intl.NumberFormat('es-CO').format(count)
}

const selectOption = (key: string) => {
  if (model.value === key) return
  model.value = key
  emit('change', key)
}
</script>
