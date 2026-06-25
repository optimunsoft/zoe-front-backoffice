<template>
  <div class="flex flex-wrap -space-x-px" :class="wrapperClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'

withDefaults(defineProps<{
  wrapperClass?: string
}>(), {
  wrapperClass: '',
})

provide('uiButtonGroup', true)
</script>
