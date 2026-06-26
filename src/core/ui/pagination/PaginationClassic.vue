<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <nav class="mb-4 sm:mb-0 sm:order-1" role="navigation" aria-label="Navigation">
      <ul class="flex justify-center">
        <li class="ml-3 first:ml-0">
          <button
            type="button"
            class="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60"
            :class="canGoPrevious
              ? 'hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300'
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'"
            :disabled="!canGoPrevious"
            @click="goToPreviousPage"
          >
            &lt;- Anterior
          </button>
        </li>
        <li class="ml-3 first:ml-0">
          <button
            type="button"
            class="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60"
            :class="canGoNext
              ? 'hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300'
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'"
            :disabled="!canGoNext"
            @click="goToNextPage"
          >
            Siguiente -&gt;
          </button>
        </li>
      </ul>
    </nav>
    <div class="text-sm text-gray-500 text-center sm:text-left">
      Mostrando
      <span class="font-medium text-gray-600 dark:text-gray-300">{{ fromItem }}</span>
      a
      <span class="font-medium text-gray-600 dark:text-gray-300">{{ toItem }}</span>
      de
      <span class="font-medium text-gray-600 dark:text-gray-300">{{ total }}</span>
      resultados
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  page?: number
  amount?: number
  total?: number
}>(), {
  page: 1,
  amount: 10,
  total: 0,
})

const emit = defineEmits<{
  'change-page': [page: number]
  previous: [page: number]
  next: [page: number]
}>()

const totalPages = computed(() => {
  if (props.amount <= 0) return 1
  return Math.max(1, Math.ceil(props.total / props.amount))
})

const currentPage = computed(() => Math.min(Math.max(props.page, 1), totalPages.value))
const canGoPrevious = computed(() => currentPage.value > 1)
const canGoNext = computed(() => currentPage.value < totalPages.value)

const fromItem = computed(() => {
  if (props.total === 0) return 0
  return (currentPage.value - 1) * props.amount + 1
})

const toItem = computed(() => Math.min(currentPage.value * props.amount, props.total))

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
</script>
