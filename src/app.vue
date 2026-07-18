<template>
  <NuxtPage />
  <NotificationsAlert />
  <ModalActiveSessions
    :modal-open="isOpen"
    :sessions="sessions"
    @close-modal="close"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import ModalActiveSessions from '~/core/auth/components/ModalActiveSessions.vue'
import { useActiveSessionsModal } from '~/core/auth/composables/use-active-sessions-modal'
import { buildDocumentTitle } from '~/core/layout/document-title'
import { NotificationsAlert } from '~/core/ui/notifications'

const route = useRoute()
const { sessions, isOpen, close } = useActiveSessionsModal()

useHead({
  title: computed(() => buildDocumentTitle(route)),
})
</script>
