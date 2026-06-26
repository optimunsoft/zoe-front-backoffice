<template>
  <component
    :is="tag"
    :class="badgeClasses"
  >
    <span
      v-if="dot"
      class="size-1.5 rounded-full"
      :class="dotClasses"
      aria-hidden="true"
    />
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type {
  BadgeAppearance,
  BadgeColor,
  BadgeSize,
  BadgeVariant,
} from './badge.types'
import {
  getBadgeDotClass,
  getBadgeSizeClass,
  getBadgeVariantClasses,
  resolveBadgeVariant,
} from './badge.utils'

const props = withDefaults(defineProps<{
  variant?: BadgeVariant
  color?: BadgeColor
  appearance?: BadgeAppearance
  size?: BadgeSize
  dot?: boolean
  pill?: boolean
  tag?: string
  badgeClass?: string
}>(), {
  color: 'neutral',
  appearance: 'soft',
  size: 'sm',
  dot: false,
  pill: true,
  tag: 'span',
  badgeClass: '',
})

const resolvedVariant = computed(() => resolveBadgeVariant(props.variant, props.color))

const badgeClasses = computed(() => [
  'inline-flex items-center gap-1.5 font-medium leading-none whitespace-nowrap',
  props.pill ? 'rounded-full' : 'rounded-md',
  getBadgeSizeClass(props.size),
  getBadgeVariantClasses(resolvedVariant.value, props.appearance),
  props.badgeClass,
])

const dotClasses = computed(() => getBadgeDotClass(resolvedVariant.value))
</script>
