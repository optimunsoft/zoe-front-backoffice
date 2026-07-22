<template>
  <ol class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
    <li
      v-for="(step, index) in steps"
      :key="step.key"
      class="flex min-w-0 flex-1 items-center"
    >
      <div class="flex min-w-0 items-center gap-2">
        <span
          class="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          :class="index === currentIndex
            ? 'bg-brand-500 text-white'
            : index < currentIndex
              ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700/60 dark:text-gray-400'"
        >
          {{ index + 1 }}
        </span>
        <span
          class="truncate text-sm font-medium"
          :class="index === currentIndex
            ? 'text-gray-900 dark:text-gray-100'
            : index < currentIndex
              ? 'text-brand-700 dark:text-brand-300'
              : 'text-gray-500 dark:text-gray-400'"
        >
          {{ step.label }}
        </span>
      </div>

      <div
        v-if="index < steps.length - 1"
        class="mx-3 hidden h-px flex-1 bg-gray-200 sm:block dark:bg-gray-700/60"
        aria-hidden="true"
      />
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { WizardStepKey } from '../../composables/use-create-global-company-wizard'

defineProps<{
  steps: ReadonlyArray<{ key: WizardStepKey, label: string }>
  currentIndex: number
}>()
</script>
