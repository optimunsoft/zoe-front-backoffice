<template>
  <ModalBasic
    id="active-sessions-modal"
    :modal-open="modalOpen"
    title="Sesiones activas"
    description="Estas son las sesiones activas asociadas a tu cuenta."
    size="xl"
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-sky-500/15 dark:bg-sky-500/20">
        <UiIcon name="history" size="md" class="text-sky-500" />
      </div>
    </template>

    <div
      v-if="sessionCards.length > 0"
      class="space-y-3"
      :class="sessionCards.length > 4 ? 'max-h-[28rem] overflow-y-auto pr-1' : ''"
    >
      <article
        v-for="session in sessionCards"
        :key="session.id"
        class="flex items-center justify-between gap-4 rounded-xl border border-gray-200 border-l-[5px] border-l-sky-500 bg-white px-3.5 py-2 dark:border-gray-700/60 dark:border-l-sky-500 dark:bg-gray-800"
      >
        <div class="flex min-w-0 flex-1 items-center gap-2.5">
          <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-50 dark:bg-sky-500/10">
            <img
              v-if="session.browser.src"
              :src="session.browser.src"
              :alt="session.browser.label"
              class="size-5 object-contain"
            >
            <UiIcon
              v-else
              name="globe"
              size="sm"
              class="text-gray-400"
            />
          </div>

          <div class="min-w-0 space-y-0.5">
            <p class="truncate text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100">
              {{ session.browser.label }}
            </p>

            <div class="flex items-center gap-1.5 text-sm leading-tight text-gray-500 dark:text-gray-400">
              <img
                v-if="session.os.src"
                :src="session.os.src"
                :alt="session.os.label"
                class="size-3.5 shrink-0 object-contain"
              >
              <span class="truncate">{{ session.os.label }}</span>
            </div>

            <div class="flex items-center gap-1.5 text-sm leading-tight text-gray-500 dark:text-gray-400">
              <UiIcon name="mapPin" size="sm" class="shrink-0 text-gray-400" />
              <span class="truncate">{{ session.location }}</span>
            </div>
          </div>
        </div>

        <div class="shrink-0 space-y-0.5 text-right text-sm leading-tight text-gray-500 dark:text-gray-400">
          <p>{{ session.loginAt }}</p>
          <p class="tabular-nums">{{ session.ip }}</p>
        </div>
      </article>
    </div>

    <p
      v-else
      class="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
    >
      No hay sesiones activas registradas.
    </p>

    <template #footer>
      <Button variant="primary" @click="handleClose">
        Entendido
      </Button>
    </template>
  </ModalBasic>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { Button } from '~/core/ui/buttons'
import { UiIcon } from '~/core/ui/icons'
import { ModalBasic } from '~/core/ui/modal'
import { mapActiveSessionsToCards } from '~/core/auth/mappers/active-sessions.mapper'
import type { SessionUser } from '~/core/auth/types/auth.types'

const props = defineProps<{
  modalOpen: boolean
  sessions: SessionUser[]
}>()

const emit = defineEmits<{
  'close-modal': []
}>()

const sessionCards = computed(() => mapActiveSessionsToCards(props.sessions))

const handleClose = () => {
  emit('close-modal')
}
</script>
