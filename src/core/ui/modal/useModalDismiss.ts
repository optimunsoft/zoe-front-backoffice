import { onMounted, onUnmounted, type Ref } from 'vue'

import type { ModalCloseEmit } from './modal.types'

/**
 * Comportamiento compartido de los modales Mosaic:
 * - Cerrar con clic fuera del contenido
 * - Cerrar con tecla Esc
 */
export function useModalDismiss(
  isOpen: () => boolean,
  modalContent: Ref<HTMLElement | null>,
  emit: ModalCloseEmit,
) {
  const close = () => emit('close-modal')

  const clickHandler = ({ target }: MouseEvent) => {
    if (!isOpen()) return
    if (!modalContent.value || modalContent.value.contains(target as Node)) return
    close()
  }

  const keyHandler = ({ keyCode }: KeyboardEvent) => {
    if (!isOpen() || keyCode !== 27) return
    close()
  }

  onMounted(() => {
    document.addEventListener('click', clickHandler)
    document.addEventListener('keydown', keyHandler)
  })

  onUnmounted(() => {
    document.removeEventListener('click', clickHandler)
    document.removeEventListener('keydown', keyHandler)
  })

  return { close }
}
