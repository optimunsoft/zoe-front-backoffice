<template>
  <ModalShell
    :id="`notification-alert-${notification.id}`"
    :modal-open="notification.open"
    size="sm"
    motion="gentle"
    layer="notification"
    @close-modal="emit('close')"
  >
    <template #default="{ close }">
      <div class="notification-alert-content relative px-6 py-7 text-center sm:px-8 sm:py-8">
        <ModalCloseButton
          class="absolute right-4 top-4 sm:right-5 sm:top-5"
          @click="close"
        />

        <div
          class="notification-alert-icon mx-auto mb-5 flex size-14 items-center justify-center rounded-full"
          :class="config.iconBgClass"
        >
          <svg
            class="size-7 fill-current"
            :class="config.iconClass"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path :d="config.iconPath" />
          </svg>
        </div>

        <div class="notification-alert-copy">
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            {{ config.label }}
          </p>

          <h2 class="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {{ notification.title }}
          </h2>

          <p
            v-if="notification.message"
            class="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400"
          >
            {{ notification.message }}
          </p>
        </div>

        <div class="notification-alert-action mt-7">
          <Button
            class="w-full"
            :variant="config.buttonVariant"
            @click="close"
          >
            Entendido
          </Button>
        </div>
      </div>
    </template>
  </ModalShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { Button } from '~/core/ui/buttons'
import ModalCloseButton from '~/core/ui/modal/ModalCloseButton.vue'
import ModalShell from '~/core/ui/modal/ModalShell.vue'

import { NOTIFICATION_ALERT_CONFIG } from './notification-alert.config'
import type { NotificationAlertItem } from './notification-alert.types'

const props = defineProps<{
  notification: NotificationAlertItem
}>()

const emit = defineEmits<{
  close: []
}>()

const config = computed(() => NOTIFICATION_ALERT_CONFIG[props.notification.type])
</script>

<style scoped>
.notification-alert-icon {
  animation: notification-alert-pop 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.08s both;
}

.notification-alert-copy {
  animation: notification-alert-rise 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.16s both;
}

.notification-alert-action {
  animation: notification-alert-rise 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.24s both;
}

@keyframes notification-alert-pop {
  from {
    opacity: 0;
    transform: scale(0.82);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes notification-alert-rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
