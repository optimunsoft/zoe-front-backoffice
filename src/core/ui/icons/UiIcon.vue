<template>
  <svg
    class="shrink-0 fill-current"
    :class="[sizeClass, iconClass]"
    :viewBox="definition.viewBox"
    aria-hidden="true"
  >
    <path
      v-for="(path, index) in definition.paths"
      :key="index"
      :d="path"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { getUiIcon } from './ui-icon.utils'
import type { UiIconName } from './ui-icons'
import type { UiIconSize } from './ui-icon.types'

const props = withDefaults(defineProps<{
  name: UiIconName
  size?: UiIconSize
  class?: string
}>(), {
  size: 'sm',
})

const sizeClassMap: Record<UiIconSize, string> = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-8',
}

const definition = computed(() => getUiIcon(props.name))
const sizeClass = computed(() => sizeClassMap[props.size])
const iconClass = computed(() => props.class)
</script>
