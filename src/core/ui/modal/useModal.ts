import { ref } from 'vue'

import type { UseModalOptions } from './modal.types'

/**
 * Patrón estándar para integrar modales en páginas:
 *
 * ```ts
 * const { modalOpen, open, close } = useModal({ onClose: resetForm })
 * ```
 *
 * ```vue
 * <Button aria-controls="my-modal" @click="open" />
 * <ModalBasic
 *   id="my-modal"
 *   :modal-open="modalOpen"
 *   @close-modal="close"
 * />
 * ```
 *
 * `ModalShell` ya hace `Teleport` a `body` y gestiona el cierre por backdrop/Esc.
 * No hace falta envolver cada modal con `<Teleport>` manualmente.
 */
export function useModal(options: UseModalOptions = {}) {
  const modalOpen = ref(false)

  const open = () => {
    modalOpen.value = true
  }

  const close = () => {
    if (!modalOpen.value) return
    modalOpen.value = false
    options.onClose?.()
  }

  const toggle = () => {
    if (modalOpen.value) close()
    else open()
  }

  return {
    modalOpen,
    open,
    close,
    toggle,
  }
}
