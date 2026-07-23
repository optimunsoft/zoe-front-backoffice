import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'

export type AnchoredOverlayStyle = {
  position: 'fixed'
  top: string
  left: string
  width: string
  zIndex: number
}

export const useAnchoredOverlay = (
  open: MaybeRefOrGetter<boolean>,
  options: {
    offset?: number
    zIndex?: number
    maxHeight?: number
    /** When true, always opens below the anchor (unless it would leave the viewport). */
    preferBelow?: boolean
  } = {},
) => {
  const anchorRef = ref<HTMLElement | null>(null)
  const style = ref<AnchoredOverlayStyle | null>(null)
  let listenersAttached = false

  const offset = options.offset ?? 4
  const zIndex = options.zIndex ?? 110
  const maxHeight = options.maxHeight ?? 224
  const preferBelow = options.preferBelow ?? false

  const updatePosition = () => {
    const el = anchorRef.value
    if (!el || !toValue(open)) {
      style.value = null
      return
    }

    const rect = el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - offset
    const spaceAbove = rect.top - offset
    const openUp = preferBelow
      ? false
      : spaceBelow < Math.min(maxHeight, 160) && spaceAbove > spaceBelow

    style.value = {
      position: 'fixed',
      top: openUp
        ? `${Math.max(8, rect.top - Math.min(maxHeight, spaceAbove) - offset)}px`
        : `${rect.bottom + offset}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex,
    }
  }

  const attachListeners = () => {
    if (listenersAttached || typeof window === 'undefined') return
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    listenersAttached = true
  }

  const detachListeners = () => {
    if (!listenersAttached || typeof window === 'undefined') return
    window.removeEventListener('resize', updatePosition)
    window.removeEventListener('scroll', updatePosition, true)
    listenersAttached = false
  }

  watch(() => toValue(open), async (isOpen) => {
    if (!isOpen) {
      style.value = null
      detachListeners()
      return
    }

    attachListeners()
    await nextTick()
    updatePosition()
  })

  onBeforeUnmount(() => {
    detachListeners()
  })

  const panelStyle = computed(() => style.value ?? undefined)

  return {
    anchorRef,
    panelStyle,
    updatePosition,
  }
}
