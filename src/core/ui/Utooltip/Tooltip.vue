<template>
  <div
    ref="triggerRef"
    class="relative inline-flex"
    :class="UI_POINTER_CHILDREN_CLASSES"
    @mouseenter="openTooltip"
    @mouseleave="closeTooltip"
    @focusin="openTooltip"
    @focusout="closeTooltip"
  >
    <slot name="trigger">
      <button
        type="button"
        class="block"
        :class="UI_ICON_BUTTON_CLASSES"
        aria-haspopup="true"
        :aria-expanded="tooltipOpen"
        @click.prevent
      >
        <svg class="fill-current text-gray-400 dark:text-gray-500" width="16" height="16" viewBox="0 0 16 16">
          <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z" />
        </svg>
      </button>
    </slot>

    <Teleport to="body">
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
          class="pointer-events-none fixed z-9999"
          :style="tooltipStyle"
          role="tooltip"
        >
          <div
            class="rounded-lg border overflow-hidden shadow-lg"
            :class="[colorClasses, sizeClasses]"
          >
            <slot />
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import { UI_ICON_BUTTON_CLASSES, UI_POINTER_CHILDREN_CLASSES } from '~/core/ui/interactive.classes'
import {
  getTooltipColorClasses,
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
const triggerRef = ref<HTMLElement | null>(null)
const tooltipStyle = ref<Record<string, string>>({
  top: '0px',
  left: '0px',
  transform: 'translate(-50%, -100%)',
})

const sizeClasses = computed(() => getTooltipSizeClasses(props.size))
const colorClasses = computed(() => getTooltipColorClasses(props.bg))

const GAP_PX = 8

const resolveTransform = (position: TooltipPosition) => {
  switch (position) {
    case 'right':
      return 'translate(0, -50%)'
    case 'left':
      return 'translate(-100%, -50%)'
    case 'bottom':
      return 'translate(-50%, 0)'
    default:
      return 'translate(-50%, -100%)'
  }
}

const updateTooltipPosition = () => {
  const trigger = triggerRef.value
  if (!trigger) return

  const rect = trigger.getBoundingClientRect()
  const position = props.position
  let top = 0
  let left = 0

  switch (position) {
    case 'right':
      top = rect.top + rect.height / 2
      left = rect.right + GAP_PX
      break
    case 'left':
      top = rect.top + rect.height / 2
      left = rect.left - GAP_PX
      break
    case 'bottom':
      top = rect.bottom + GAP_PX
      left = rect.left + rect.width / 2
      break
    default:
      top = rect.top - GAP_PX
      left = rect.left + rect.width / 2
      break
  }

  tooltipStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    transform: resolveTransform(position),
  }
}

const bindPositionListeners = () => {
  window.addEventListener('scroll', updateTooltipPosition, true)
  window.addEventListener('resize', updateTooltipPosition)
}

const unbindPositionListeners = () => {
  window.removeEventListener('scroll', updateTooltipPosition, true)
  window.removeEventListener('resize', updateTooltipPosition)
}

const openTooltip = async () => {
  tooltipOpen.value = true
  await nextTick()
  updateTooltipPosition()
  bindPositionListeners()
}

const closeTooltip = () => {
  tooltipOpen.value = false
  unbindPositionListeners()
}

watch(
  () => props.position,
  () => {
    if (tooltipOpen.value) updateTooltipPosition()
  },
)

onBeforeUnmount(() => {
  unbindPositionListeners()
})
</script>
