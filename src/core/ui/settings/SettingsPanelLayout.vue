<template>
  <div
    class="relative flex h-0 min-h-0 flex-1 flex-col md:flex-row"
    :class="layoutClass"
  >
    <div
      class="pointer-events-none absolute inset-y-0 left-60 z-10 hidden w-px bg-gray-200 md:block dark:bg-gray-700/60"
      aria-hidden="true"
    />

    <aside class="flex min-h-0 shrink-0 flex-col border-b border-gray-200 md:w-60 md:border-b-0 dark:border-gray-700/60">
      <div class="flex min-h-0 flex-1 flex-col">
        <slot name="sidebar" />
      </div>
    </aside>

    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <slot name="panel" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  layoutClass?: string
}>(), {
  layoutClass: 'min-h-0 flex-1',
})
</script>
