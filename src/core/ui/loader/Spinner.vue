<template>
  <svg
    class="animate-spin fill-current shrink-0"
    :class="sizeClass"
    viewBox="0 0 16 16"
    role="status"
    aria-label="Cargando"
  >
    <path d="M8 16a7.928 7.928 0 01-3.428-.77l.857-1.807A6.006 6.006 0 0014 8c0-3.309-2.691-6-6-6a6.006 6.006 0 00-5.422 8.572l-1.806.859A7.929 7.929 0 010 8c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type SpinnerSize = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  size?: SpinnerSize
}>(), {
  size: 'sm',
})

const sizeClassMap: Record<SpinnerSize, string> = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-8',
}

const sizeClass = computed(() => sizeClassMap[props.size])
</script>
