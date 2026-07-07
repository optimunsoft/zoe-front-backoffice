import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const NOTIFICATION_MODAL_PREFIX = 'notification-alert-'

export const isNotificationModalId = (id: string) =>
  id.startsWith(NOTIFICATION_MODAL_PREFIX)

export const useModalStackStore = defineStore('modalStack', () => {
  const openModalIds = ref<string[]>([])

  const register = (id: string) => {
    if (openModalIds.value.includes(id)) return
    openModalIds.value = [...openModalIds.value, id]
  }

  const unregister = (id: string) => {
    openModalIds.value = openModalIds.value.filter((item) => item !== id)
  }

  const topModalId = computed(() => openModalIds.value.at(-1) ?? null)

  const hasBlockingModal = computed(() =>
    openModalIds.value.some((id) => !isNotificationModalId(id)),
  )

  const syncBodyScrollLock = () => {
    if (!import.meta.client) return
    document.body.style.overflow = openModalIds.value.length > 0 ? 'hidden' : ''
  }

  return {
    openModalIds,
    register,
    unregister,
    topModalId,
    hasBlockingModal,
    syncBodyScrollLock,
  }
})
