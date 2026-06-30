<template>
  <NotificationAlertModal
    v-if="notificationStore.current"
    :notification="notificationStore.current"
    @close="notificationStore.dismissCurrent"
  />
</template>

<script setup lang="ts">
import NotificationAlertModal from './NotificationAlertModal.vue'
import { useNotificationAlertStore } from './notification-alert.store'

const notificationStore = useNotificationAlertStore()
</script>
