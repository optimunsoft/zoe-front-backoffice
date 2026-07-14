<template>
  <NuxtPage />
  <NotificationsAlert />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { buildDocumentTitle } from '~/core/layout/document-title'
import { NotificationsAlert } from '~/core/ui/notifications'

const route = useRoute()

useHead({
  title: computed(() => buildDocumentTitle(route)),
})
</script>
