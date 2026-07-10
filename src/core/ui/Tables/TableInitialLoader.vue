<template>
  <div class="flex min-h-72 items-center justify-center rounded-xl bg-white shadow-xs dark:bg-gray-800">
    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  message?: string
}>(), {
  message: 'Cargando...',
})
</script>
