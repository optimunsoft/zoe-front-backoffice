import type { ModalCloseEmit } from './modal.types'

/**
 * Comportamiento compartido de los modales:
 * - Exponer `close()` para X y acciones explícitas
 *
 * El clic fuera (backdrop) y la tecla Esc no cierran el modal.
 */
export function useModalDismiss(emit: ModalCloseEmit) {
  const close = () => emit('close-modal')

  return { close }
}
