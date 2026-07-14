import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useModalStackStore } from '~/core/ui/modal/modal-stack.store'

import type { NotificationAlertItem, NotificationAlertType } from './notification-alert.types'

/** Coincide con la salida del panel en ModalShell (`duration-200`) + margen. */
const MODAL_LEAVE_MS = 220
/** Pausa breve tras el cierre para que el fondo “respire” antes de la alerta. */
const AFTER_MODAL_BREATH_MS = 160
/** Intervalo para esperar a que el modal de formulario deje de bloquear. */
const BLOCKING_POLL_MS = 40
/** Retraso corto para errores (pueden mostrarse sobre el modal). */
const ERROR_DISPLAY_DELAY_MS = 80

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

  const reveal = (id: number) => {
    displayTimers.delete(id)

    const item = items.value.find((entry) => entry.id === id)
    if (item) item.visible = true
  }

  const scheduleAfterDelay = (id: number, delayMs: number) => {
    clearDisplayTimer(id)
    const timer = setTimeout(() => reveal(id), delayMs)
    displayTimers.set(id, timer)
  }

  /**
   * Éxito: espera a que el modal de formulario cierre (si lo hay),
   * deja terminar su animación de salida y luego muestra la alerta.
   */
  const scheduleSuccessVisibility = (id: number) => {
    clearDisplayTimer(id)

    const waitForClearStack = () => {
      if (!items.value.some((entry) => entry.id === id)) return

      const modalStack = useModalStackStore()
      if (modalStack.hasBlockingModal) {
        const timer = setTimeout(waitForClearStack, BLOCKING_POLL_MS)
        displayTimers.set(id, timer)
        return
      }

      scheduleAfterDelay(id, MODAL_LEAVE_MS + AFTER_MODAL_BREATH_MS)
    }

    // Da tiempo a que el handler del modal emita close-modal tras el onResponse.
    const timer = setTimeout(waitForClearStack, BLOCKING_POLL_MS)
    displayTimers.set(id, timer)
  }

  const scheduleVisibility = (id: number, type: NotificationAlertType) => {
    if (type === 'success') {
      scheduleSuccessVisibility(id)
      return
    }

    scheduleAfterDelay(id, ERROR_DISPLAY_DELAY_MS)
  }

  /** Cancela alertas en cola (aún no visibles) para evitar dobles / éxito tras error. */
  const clearPending = (type?: NotificationAlertType) => {
    const pending = items.value.filter((item) => {
      if (!item.open || item.visible) return false
      if (type && item.type !== type) return false
      return true
    })

    pending.forEach((item) => remove(item.id))
  }

  const push = ({ type, title, message = '' }: PushNotificationPayload) => {
    const active = current.value

    // Misma alerta ya visible → no duplicar.
    if (active && active.type === type && active.title === title && active.message === message) {
      return active.id
    }

    if (type === 'success') {
      // Solo una éxito en cola; si hay un error visible, no apilar éxito detrás.
      clearPending('success')
      if (active?.type === 'error') return active.id
    }

    if (type === 'error') {
      // Un error cancela éxitos pendientes (evita “error → éxito”).
      clearPending('success')
      clearPending('error')
    }

    const id = ++nextId

    items.value.push({
      id,
      type,
      title,
      message,
      open: true,
      visible: false,
    })

    scheduleVisibility(id, type)
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
