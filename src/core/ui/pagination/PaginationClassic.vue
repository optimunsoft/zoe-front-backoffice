<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <nav role="navigation" aria-label="Paginación">
      <ul class="flex items-center gap-1.5">
        <li>
          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400"
            :class="canGoPrevious
              ? 'hover:border-gray-300 hover:text-gray-700 dark:hover:border-gray-600 dark:hover:text-gray-200'
              : 'cursor-not-allowed opacity-40'"
            :disabled="!canGoPrevious"
            aria-label="Primera página"
            @click="goToFirstPage"
          >
            <svg class="size-4 fill-current" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M7.4 2.6 2 8l5.4 5.4 1.4-1.4L4.8 8l4-4-1.4-1.4z" />
              <path d="M12.4 2.6 7 8l5.4 5.4 1.4-1.4L9.8 8l4-4-1.4-1.4z" />
            </svg>
          </button>
        </li>

        <li>
          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400"
            :class="canGoPrevious
              ? 'hover:border-gray-300 hover:text-gray-700 dark:hover:border-gray-600 dark:hover:text-gray-200'
              : 'cursor-not-allowed opacity-40'"
            :disabled="!canGoPrevious"
            aria-label="Página anterior"
            @click="goToPreviousPage"
          >
            <svg class="size-4 fill-current" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M9.4 13.4 8 14.8 2.2 9l5.8-5.8L9.4 4.6 5 9l4.4 4.4z" />
            </svg>
          </button>
        </li>

        <li v-for="(item, index) in pageItems" :key="`${item}-${index}`">
          <span
            v-if="item === 'ellipsis'"
            class="inline-flex size-9 items-center justify-center text-sm text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          >
            …
          </span>
          <button
            v-else
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-md border text-sm font-medium transition-colors"
            :class="item === currentPage
              ? 'border-transparent bg-[#007BFF] text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600'"
            :aria-current="item === currentPage ? 'page' : undefined"
            :aria-label="`Ir a la página ${item}`"
            @click="goToPage(item)"
          >
            {{ item }}
          </button>
        </li>

        <li>
          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400"
            :class="canGoNext
              ? 'hover:border-gray-300 hover:text-gray-700 dark:hover:border-gray-600 dark:hover:text-gray-200'
              : 'cursor-not-allowed opacity-40'"
            :disabled="!canGoNext"
            aria-label="Página siguiente"
            @click="goToNextPage"
          >
            <svg class="size-4 fill-current" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6.6 2.6 8 1.2 13.8 7 8 12.8 6.6 11.4 11 7 6.6 2.6z" />
            </svg>
          </button>
        </li>

        <li>
          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400"
            :class="canGoNext
              ? 'hover:border-gray-300 hover:text-gray-700 dark:hover:border-gray-600 dark:hover:text-gray-200'
              : 'cursor-not-allowed opacity-40'"
            :disabled="!canGoNext"
            aria-label="Última página"
            @click="goToLastPage"
          >
            <svg class="size-4 fill-current" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.6 2.6 5 1.2 10.8 7 5 12.8 3.6 11.4 8 7 3.6 2.6z" />
              <path d="M8.6 2.6 10 1.2 15.8 7 10 12.8 8.6 11.4 13 7 8.6 2.6z" />
            </svg>
          </button>
        </li>
      </ul>
    </nav>

    <div class="flex justify-start sm:justify-end">
      <label class="sr-only" for="pagination-amount">Resultados por página</label>
      <select
        id="pagination-amount"
        class="form-select min-w-36 rounded-md border-gray-200 bg-white py-2 text-sm text-gray-600 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300"
        :value="amount"
        @change="onAmountChange"
      >
        <option
          v-for="option in resolvedAmountOptions"
          :key="option"
          :value="option"
        >
          {{ option }} por página
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type PageItem = number | 'ellipsis'

const props = withDefaults(defineProps<{
  page?: number
  amount?: number
  total?: number
  amountOptions?: number[]
  maxVisiblePages?: number
}>(), {
  page: 1,
  amount: 10,
  total: 0,
  amountOptions: () => [10, 25, 50],
  maxVisiblePages: 5,
})

const emit = defineEmits<{
  'change-page': [page: number]
  'change-amount': [amount: number]
  previous: [page: number]
  next: [page: number]
}>()

const resolvedAmountOptions = computed(() => {
  const options = new Set(props.amountOptions)
  if (props.amount > 0) options.add(props.amount)
  return Array.from(options).sort((a, b) => a - b)
})

const totalPages = computed(() => {
  if (props.amount <= 0) return 1
  return Math.max(1, Math.ceil(props.total / props.amount))
})

const currentPage = computed(() => Math.min(Math.max(props.page, 1), totalPages.value))
const canGoPrevious = computed(() => currentPage.value > 1)
const canGoNext = computed(() => currentPage.value < totalPages.value)

const pageItems = computed((): PageItem[] => {
  const total = totalPages.value
  const current = currentPage.value
  const maxVisible = Math.max(3, props.maxVisiblePages)

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, total, current])

  // Vecinos de la página actual
  if (current - 1 > 1) pages.add(current - 1)
  if (current + 1 < total) pages.add(current + 1)

  // Completar hasta maxVisible priorizando el alrededor de la página actual
  let left = current - 2
  let right = current + 2
  while (pages.size < maxVisible && (left >= 1 || right <= total)) {
    if (left >= 1) pages.add(left)
    if (pages.size >= maxVisible) break
    if (right <= total) pages.add(right)
    left -= 1
    right += 1
  }

  const sorted = Array.from(pages).sort((a, b) => a - b)
  const items: PageItem[] = []

  for (let index = 0; index < sorted.length; index += 1) {
    const pageNumber = sorted[index]!
    const previous = sorted[index - 1]

    if (previous != null && pageNumber - previous > 1) {
      items.push('ellipsis')
    }

    items.push(pageNumber)
  }

  return items
})

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  emit('change-page', page)
}

const goToFirstPage = () => goToPage(1)

const goToLastPage = () => goToPage(totalPages.value)

const goToPreviousPage = () => {
  if (!canGoPrevious.value) return
  const page = currentPage.value - 1
  emit('previous', page)
  emit('change-page', page)
}

const goToNextPage = () => {
  if (!canGoNext.value) return
  const page = currentPage.value + 1
  emit('next', page)
  emit('change-page', page)
}

const onAmountChange = (event: Event) => {
  const value = Number((event.target as HTMLSelectElement).value)
  if (!Number.isFinite(value) || value <= 0 || value === props.amount) return
  emit('change-amount', value)
}
</script>
