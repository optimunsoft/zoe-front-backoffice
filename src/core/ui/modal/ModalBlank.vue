<template>
  <!-- Modal backdrop -->
  <transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-out duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-show="modalOpen" class="fixed inset-0 bg-gray-900/30 z-50 transition-opacity" aria-hidden="true"></div>
  </transition>
  <!-- Modal dialog -->
  <transition
    enter-active-class="transition ease-in-out duration-200"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in-out duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div v-show="modalOpen" :id="id" class="fixed inset-0 z-50 overflow-hidden flex items-center my-4 justify-center px-4 sm:px-6" role="dialog" aria-modal="true">
      <div ref="modalContent" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-auto max-w-lg w-full max-h-full">
        <slot />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useModalDismiss } from './useModalDismiss'

const props = defineProps<{
  id: string
  modalOpen: boolean
}>()

const emit = defineEmits<{
  'close-modal': []
}>()

const modalContent = ref<HTMLElement | null>(null)
useModalDismiss(() => props.modalOpen, modalContent, emit)
</script>
