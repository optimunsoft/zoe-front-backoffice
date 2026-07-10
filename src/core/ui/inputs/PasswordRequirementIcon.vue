<template>
  <svg
    v-if="met"
    class="h-4 w-4 shrink-0 fill-current"
    viewBox="0 0 16 16"
    aria-hidden="true"
  >
    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm3.78 5.72a.75.75 0 0 0-1.06-1.06L7 8.38 5.28 6.66a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l4.25-4.25Z" />
  </svg>

  <svg
    v-else
    class="h-4 w-4 shrink-0 fill-current"
    viewBox="0 0 16 16"
    aria-hidden="true"
  >
    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  met: boolean
}>()
</script>
