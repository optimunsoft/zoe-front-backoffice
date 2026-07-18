import { computed, ref } from 'vue'

import type { SessionUser } from '../types/auth.types'

const sessions = ref<SessionUser[]>([])
const isRevealed = ref(false)

const sortByLoginAtDesc = (items: SessionUser[]): SessionUser[] =>
  [...items].sort((left, right) => {
    const leftTime = new Date(left.loginAt).getTime()
    const rightTime = new Date(right.loginAt).getTime()

    if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) return 0
    if (Number.isNaN(leftTime)) return 1
    if (Number.isNaN(rightTime)) return -1

    return rightTime - leftTime
  })

/**
 * Controla el modal global de sesiones activas.
 * `queue` guarda datos sin abrir; `reveal` abre solo si hay sesiones; `close` limpia el estado.
 */
export const useActiveSessionsModal = () => {
  const isOpen = computed(() => isRevealed.value && sessions.value.length > 0)

  const queue = (items: SessionUser[] | undefined | null) => {
    sessions.value = Array.isArray(items) ? sortByLoginAtDesc(items) : []
    isRevealed.value = false
  }

  const reveal = () => {
    if (sessions.value.length === 0) return
    isRevealed.value = true
  }

  const close = () => {
    isRevealed.value = false
    sessions.value = []
  }

  return {
    sessions: computed(() => sessions.value),
    isOpen,
    queue,
    reveal,
    close,
  }
}
