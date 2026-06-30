import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const NOTIFICATION_MODAL_PREFIX = 'notification-alert-'

export const isNotificationModalId = (id: string) =>
  id.startsWith(NOTIFICATION_MODAL_PREFIX)

export const useModalStackStore = defineStore('modalStack', () => {
  const openModalIds = ref<Set<string>>(new Set())

  const register = (id: string) => {
    openModalIds.value = new Set(openModalIds.value).add(id)
  }

  const unregister = (id: string) => {
    if (!openModalIds.value.has(id)) return

    const next = new Set(openModalIds.value)
    next.delete(id)
    openModalIds.value = next
  }

  const hasBlockingModal = computed(() =>
    [...openModalIds.value].some((id) => !isNotificationModalId(id)),
  )

  return {
    openModalIds,
    register,
    unregister,
    hasBlockingModal,
  }
})
