import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { NotificationAlertItem, NotificationAlertType } from './notification-alert.types'

const DISPLAY_DELAY_MS = 400

type PushNotificationPayload = {
  type: NotificationAlertType
  title: string
  message?: string
}

export const useNotificationAlertStore = defineStore('notificationAlert', () => {
  const items = ref<NotificationAlertItem[]>([])
  let nextId = 0
  const displayTimers = new Map<number, ReturnType<typeof setTimeout>>()

  const current = computed(() =>
    items.value.find((item) => item.open && item.visible) ?? null,
  )

  const clearDisplayTimer = (id: number) => {
    const timer = displayTimers.get(id)
    if (!timer) return

    clearTimeout(timer)
    displayTimers.delete(id)
  }

  const remove = (id: number) => {
    clearDisplayTimer(id)
    items.value = items.value.filter((item) => item.id !== id)
  }

  const dismissCurrent = () => {
    const active = current.value
    if (!active) return

    active.open = false

    setTimeout(() => {
      remove(active.id)
    }, 300)
  }

  const scheduleVisibility = (id: number) => {
    const timer = setTimeout(() => {
      displayTimers.delete(id)

      const item = items.value.find((entry) => entry.id === id)
      if (item) item.visible = true
    }, DISPLAY_DELAY_MS)

    displayTimers.set(id, timer)
  }

  const push = ({ type, title, message = '' }: PushNotificationPayload) => {
    const id = ++nextId

    items.value.push({
      id,
      type,
      title,
      message,
      open: true,
      visible: false,
    })

    scheduleVisibility(id)
    return id
  }

  const showSuccess = (title: string, message?: string) =>
    push({ type: 'success', title, message })

  const showError = (title: string, message?: string) =>
    push({ type: 'error', title, message })

  const showWarning = (title: string, message?: string) =>
    push({ type: 'warning', title, message })

  const showInfo = (title: string, message?: string) =>
    push({ type: 'info', title, message })

  return {
    items,
    current,
    push,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    remove,
    dismissCurrent,
  }
})
