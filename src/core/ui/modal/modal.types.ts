export type ModalCloseEmit = (event: 'close-modal') => void

export type UseModalOptions = {
  /** Se ejecuta cada vez que el modal se cierra (X, Esc, clic fuera o `close()`). */
  onClose?: () => void
}
