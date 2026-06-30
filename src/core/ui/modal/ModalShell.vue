<template>
  <transition
    :enter-active-class="backdropEnterActiveClass"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    :leave-active-class="backdropLeaveActiveClass"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-show="modalOpen"
      class="fixed inset-0 z-50 bg-gray-900/45 backdrop-blur-[3px] dark:bg-gray-950/65"
      aria-hidden="true"
    />
  </transition>

  <div
    v-show="modalOpen"
    class="fixed inset-0 z-50 flex justify-center overflow-hidden px-4 sm:px-6"
    :class="position === 'top' ? 'items-start pt-20 pb-4' : 'items-center py-4'"
    role="dialog"
    aria-modal="true"
  >
    <transition
      :enter-active-class="panelEnterActiveClass"
      :enter-from-class="panelEnterFromClass"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      :leave-active-class="panelLeaveActiveClass"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-show="modalOpen"
        :id="id"
        ref="modalContent"
        class="flex w-full max-h-[min(90vh,calc(100dvh-2rem))] flex-col overflow-hidden rounded-xl bg-white shadow-2xl shadow-gray-900/10 ring-1 ring-gray-900/5 dark:bg-gray-800 dark:shadow-black/40 dark:ring-gray-700/60"
        :class="sizeClass"
      >
        <slot :close="close" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

import type { ModalPosition, ModalSize } from './modal.types'
import { useModalStackStore } from './modal-stack.store'
import { useModalDismiss } from './useModalDismiss'

const props = withDefaults(defineProps<{
  id: string
  modalOpen: boolean
  size?: ModalSize
  position?: ModalPosition
  motion?: 'default' | 'gentle'
}>(), {
  size: 'lg',
  position: 'center',
  motion: 'default',
})

const emit = defineEmits<{
  'close-modal': []
}>()

const modalContent = ref<HTMLElement | null>(null)
const { close } = useModalDismiss(() => props.modalOpen, modalContent, emit)

watch(
  () => props.modalOpen,
  (open) => {
    if (!import.meta.client) return

    const modalStack = useModalStackStore()
    if (open) modalStack.register(props.id)
    else modalStack.unregister(props.id)

    document.body.style.overflow = open ? 'hidden' : ''
  },
  { immediate: true },
)

onUnmounted(() => {
  if (import.meta.client) {
    useModalStackStore().unregister(props.id)
    document.body.style.overflow = ''
  }
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
  }

  return sizes[props.size]
})
</script>
