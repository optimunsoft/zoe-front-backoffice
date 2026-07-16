<template>
  <div class="flex h-dvh overflow-hidden bg-gray-100 dark:bg-gray-900">

    <AppSidebar :sidebarOpen="sidebarOpen" @close-sidebar="sidebarOpen = false" />

    <div class="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">

      <AppHeader :sidebarOpen="sidebarOpen" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="grow">
        <NuxtPage />
      </main>

    </div>

    <ModalActiveSessions
      :modal-open="sessionsModalOpen"
      :sessions="authStore.activeSessions"
      @close-modal="closeSessionsModal"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import ModalActiveSessions from '~/core/auth/components/ModalActiveSessions.vue'
import { useAuthStore } from '~/core/auth/store/auth.store'
import AppSidebar from '~/core/layout/sidebar/Sidebar.vue'
import AppHeader from '~/core/layout/Header.vue'

const authStore = useAuthStore()
const sidebarOpen = ref(false)

const sessionsModalOpen = computed(() => authStore.activeSessions.length > 0)

const closeSessionsModal = () => {
  authStore.clearActiveSessions()
}
</script>
