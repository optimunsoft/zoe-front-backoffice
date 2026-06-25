<template>
  <div
    class="relative"
    @mouseenter="tooltipOpen = true"
    @mouseleave="tooltipOpen = false"
    @focusin="tooltipOpen = true"
    @focusout="tooltipOpen = false"
  >
    <button
      type="button"
      class="block"
      aria-haspopup="true"
      :aria-expanded="tooltipOpen"
      @click.prevent
    >
      <svg class="fill-current text-gray-400 dark:text-gray-500" width="16" height="16" viewBox="0 0 16 16">
        <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z" />
      </svg>
    </button>
    <div class="z-10 absolute" :class="positionOuterClasses">
      <transition
        enter-active-class="transition ease-out duration-200 transform"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-out duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-show="tooltipOpen"
          class="rounded-lg border overflow-hidden shadow-lg"
          :class="[colorClasses, sizeClasses, positionInnerClasses]"
        >
          <slot />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  getTooltipColorClasses,
  getTooltipPositionInnerClasses,
  getTooltipPositionOuterClasses,
  getTooltipSizeClasses,
} from './tooltip.utils'
import type { TooltipBg, TooltipPosition, TooltipSize } from './tooltip.types'

const props = withDefaults(defineProps<{
  bg?: TooltipBg
  size?: TooltipSize
  position?: TooltipPosition
}>(), {
  bg: 'default',
  size: 'default',
  position: 'top',
})

const tooltipOpen = ref(false)

const positionOuterClasses = computed(() => getTooltipPositionOuterClasses(props.position))
const positionInnerClasses = computed(() => getTooltipPositionInnerClasses(props.position))
const sizeClasses = computed(() => getTooltipSizeClasses(props.size))
const colorClasses = computed(() => getTooltipColorClasses(props.bg))
</script>
