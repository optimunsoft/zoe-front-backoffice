<template>
  <div class="flex h-dvh overflow-hidden bg-gray-100 dark:bg-gray-900">

    <AppSidebar :sidebarOpen="sidebarOpen" @close-sidebar="sidebarOpen = false" />

    <div class="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">

      <AppHeader :sidebarOpen="sidebarOpen" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="grow">
        <NuxtPage />
      </main>

    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useActiveSessionsModal } from '~/core/auth/composables/use-active-sessions-modal'
import AppSidebar from '~/core/layout/sidebar/Sidebar.vue'
import AppHeader from '~/core/layout/Header.vue'

const sidebarOpen = ref(false)
const { reveal } = useActiveSessionsModal()

onMounted(() => {
  reveal()
})
</script>
