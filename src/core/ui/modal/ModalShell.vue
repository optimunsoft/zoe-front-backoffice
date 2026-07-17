<template>
  <Teleport to="body">
    <transition
      :enter-active-class="backdropEnterActiveClass"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      :leave-active-class="backdropLeaveActiveClass"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modalOpen"
        class="fixed inset-0 bg-gray-900/45 backdrop-blur-[3px] dark:bg-gray-950/65"
        :class="layerClass"
        aria-hidden="true"
      />
    </transition>

    <transition
      :enter-active-class="panelEnterActiveClass"
      :enter-from-class="panelEnterFromClass"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      :leave-active-class="panelLeaveActiveClass"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-[0.98] translate-y-2"
    >
      <div
        v-if="modalOpen"
        class="fixed inset-0 flex justify-center overflow-hidden px-4 sm:px-6 pointer-events-none"
        :class="[
          layerClass,
          position === 'top' ? 'items-start pt-20 pb-4' : 'items-center py-4',
        ]"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
      >
        <div
          :id="id"
          class="pointer-events-auto flex w-full max-h-[min(90vh,calc(100dvh-2rem))] min-h-0 flex-col overflow-hidden rounded-xl bg-white shadow-2xl shadow-gray-900/10 ring-1 ring-gray-900/5 dark:bg-gray-800 dark:shadow-black/40 dark:ring-gray-700/60"
          :class="sizeClass"
          @click.stop
        >
          <slot :close="close" />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'

import type { ModalLayer, ModalPosition, ModalSize } from './modal.types'
import { useModalStackStore } from './modal-stack.store'
import { useModalDismiss } from './useModalDismiss'

const props = withDefaults(defineProps<{
  id: string
  modalOpen: boolean
  size?: ModalSize
  position?: ModalPosition
  motion?: 'default' | 'gentle'
  layer?: ModalLayer
  ariaLabelledby?: string
  ariaDescribedby?: string
}>(), {
  size: 'lg',
  position: 'center',
  motion: 'default',
  layer: 'base',
})

const emit = defineEmits<{
  'close-modal': []
}>()

const { close } = useModalDismiss(() => props.id, () => props.modalOpen, emit)

watch(
  () => props.modalOpen,
  (open) => {
    if (!import.meta.client) return

    const modalStack = useModalStackStore()
    if (open) {
      modalStack.register(props.id)
    } else {
      modalStack.unregister(props.id)
    }

    modalStack.syncBodyScrollLock()
  },
  { immediate: true },
)

onUnmounted(() => {
  if (!import.meta.client) return

  const modalStack = useModalStackStore()
  modalStack.unregister(props.id)
  modalStack.syncBodyScrollLock()
})

const layerClass = computed(() => {
  const layers: Record<ModalLayer, string> = {
    base: 'z-[80]',
    elevated: 'z-[90]',
    notification: 'z-[100]',
  }

  return layers[props.layer]
})

const isGentleMotion = computed(() => props.motion === 'gentle')

const backdropEnterActiveClass = computed(() =>
  isGentleMotion.value
    ? 'transition ease-out duration-500'
    : 'transition ease-out duration-300',
)

const backdropLeaveActiveClass = computed(() =>
  isGentleMotion.value
    ? 'transition ease-in duration-200'
    : 'transition ease-in duration-200',
)

const panelEnterActiveClass = computed(() =>
  isGentleMotion.value
    ? 'transition ease-[cubic-bezier(0.16,1,0.3,1)] duration-500'
    : 'transition ease-out duration-300',
)

const panelLeaveActiveClass = computed(() =>
  isGentleMotion.value
    ? 'transition ease-in duration-200'
    : 'transition ease-in duration-200',
)

const panelEnterFromClass = computed(() =>
  isGentleMotion.value
    ? 'opacity-0 scale-[0.96] translate-y-3'
    : 'opacity-0 scale-[0.98] translate-y-2',
)

const sizeClass = computed(() => {
  const sizes: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-[calc(100vw-2rem)]',
  }

  return sizes[props.size]
})
</script>
