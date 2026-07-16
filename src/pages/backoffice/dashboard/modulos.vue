<template>
  <TablesModules v-if="authStore.isAdminBackOfficeUser" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { navigateTo } from '#app'

import { useAuthStore } from '~/core/auth/store/auth.store'
import TablesModules from '~/modules/modules/components/tables/TablesModules.vue'

const authStore = useAuthStore()

onMounted(() => {
  if (!authStore.isAdminBackOfficeUser) {
    void navigateTo('/backoffice/dashboard/superusuarios')
  }
})
</script>
