<template>
  <ModalShell
    :id="id"
    :modal-open="modalOpen"
    :size="size"
    :position="position"
    :motion="motion"
    :aria-labelledby="title ? titleId : undefined"
    :aria-describedby="description ? descriptionId : undefined"
    @close-modal="emit('close-modal')"
  >
    <template #default="{ close }">
      <header
        class="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200/80 bg-white px-6 py-4 dark:border-gray-700/60 dark:bg-gray-800"
      >
        <div class="flex min-w-0 flex-1 items-start gap-3 pr-2">
          <div v-if="$slots.icon" class="mt-0.5 shrink-0">
            <slot name="icon" />
          </div>
          <div v-if="title || description" class="min-w-0">
            <h2
              v-if="title"
              :id="titleId"
              class="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100"
            >
              {{ title }}
            </h2>
            <p
              v-if="description"
              :id="descriptionId"
              class="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400"
            >
              {{ description }}
            </p>
          </div>
        </div>
        <ModalCloseButton @click="close" />
      </header>

      <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          class="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5 scrollbar-gutter-stable"
          :class="bodyClass"
        >
          <div
            v-if="loading"
            class="flex items-center justify-center py-12"
          >
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ loadingText }}
            </p>
          </div>
          <slot v-else />
        </div>
        <div
          v-if="!loading && !hideBodyFade"
          class="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-white to-transparent dark:from-gray-800"
          aria-hidden="true"
        />
      </div>

      <footer
        v-if="$slots.footer"
        class="flex shrink-0 items-center justify-end gap-2 border-t border-gray-200/80 bg-gray-50/80 px-6 py-4 dark:border-gray-700/60 dark:bg-gray-900/40"
      >
        <slot name="footer" />
      </footer>
    </template>
  </ModalShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import ModalCloseButton from './ModalCloseButton.vue'
import ModalShell from './ModalShell.vue'
import type { ModalPosition, ModalSize } from './modal.types'

const props = withDefaults(defineProps<{
  id: string
  modalOpen: boolean
  title?: string
  description?: string
  size?: ModalSize
  position?: ModalPosition
  motion?: 'default' | 'gentle'
  bodyClass?: string
  loading?: boolean
  loadingText?: string
  hideBodyFade?: boolean
}>(), {
  size: 'lg',
  position: 'center',
  motion: 'default',
  loading: false,
  loadingText: 'Cargando...',
  hideBodyFade: false,
})

const emit = defineEmits<{
  'close-modal': []
}>()

const titleId = computed(() => `${props.id}-title`)
const descriptionId = computed(() => `${props.id}-description`)
</script>
