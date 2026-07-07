<template>
  <div class="flex h-0 min-h-0 flex-1 flex-col">
    <div
      class="h-0 min-h-0 flex-1 overflow-y-scroll overscroll-contain p-6 space-y-6 scrollbar-thin"
      :style="scrollStyle"
    >
      <div v-if="title || description">
        <h2
          v-if="title"
          class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-1"
        >
          {{ title }}
        </h2>
        <p
          v-if="description"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          {{ description }}
        </p>
      </div>
      <slot />
    </div>
    <footer v-if="$slots.footer">
      <div class="flex flex-col px-6 py-5 border-t border-gray-200 dark:border-gray-700/60">
        <slot name="footer" />
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title?: string
  description?: string
  maxHeight?: string
}>()

const scrollStyle = computed(() => {
  if (!props.maxHeight) return undefined

  return {
    maxHeight: props.maxHeight,
  }
})
</script>
