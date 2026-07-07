import { onMounted, onUnmounted } from 'vue'

import type { ModalCloseEmit } from './modal.types'
import { useModalStackStore } from './modal-stack.store'

/**
 * Comportamiento compartido de los modales:
 * - Cerrar con tecla Esc (solo el modal superior del stack)
 *
 * El cierre por clic fuera se maneja en `ModalShell` sobre el backdrop,
 * para evitar que el mismo clic que abre el modal lo cierre de inmediato.
 */
export function useModalDismiss(
  modalId: () => string,
  isOpen: () => boolean,
  emit: ModalCloseEmit,
) {
  const close = () => emit('close-modal')

  const keyHandler = (event: KeyboardEvent) => {
    if (!isOpen() || event.key !== 'Escape') return

    const modalStack = useModalStackStore()
    if (modalStack.topModalId !== modalId()) return

    close()
  }

  onMounted(() => {
    document.addEventListener('keydown', keyHandler)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', keyHandler)
  })

  return { close }
}
