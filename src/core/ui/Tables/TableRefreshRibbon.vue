<template>
  <div
    v-if="active"
    class="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden"
    role="progressbar"
    aria-label="Actualizando datos"
    aria-busy="true"
  >
    <div class="h-full w-full bg-violet-500/15 dark:bg-violet-400/20">
      <div class="table-refresh-ribbon-bar h-full w-2/5 rounded-full bg-violet-500 dark:bg-violet-400" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  active?: boolean
}>(), {
  active: false,
})
</script>

<style scoped>
.table-refresh-ribbon-bar {
  animation: table-refresh-slide 1.1s ease-in-out infinite;
}

@keyframes table-refresh-slide {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(350%);
  }
}
</style>
