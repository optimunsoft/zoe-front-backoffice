<template>
  <UBadge
    v-bind="TABLE_BADGE_PROPS"
    :color="color"
    :badge-class="badgeClass"
  >
    <slot />
  </UBadge>
</template>

<script setup lang="ts">
import type { BadgeColor } from './badge.types'
import { TABLE_BADGE_PROPS } from './table-badge.constants'
import UBadge from './UBadge.vue'

withDefaults(defineProps<{
  color?: BadgeColor
  badgeClass?: string
}>(), {
  color: 'neutral',
  badgeClass: '',
})
</script>
