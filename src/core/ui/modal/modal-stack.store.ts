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

    if (openModalIds.value.length > 0) {
      document.body.style.overflow = 'hidden'
      return
    }

    document.body.style.removeProperty('overflow')
  }

  /** Útil cuando un modal queda huérfano tras un error de render en producción. */
  const forceUnlock = () => {
    openModalIds.value = []
    syncBodyScrollLock()
  }

  return {
    openModalIds,
    register,
    unregister,
    topModalId,
    hasBlockingModal,
    syncBodyScrollLock,
    forceUnlock,
  }
})
