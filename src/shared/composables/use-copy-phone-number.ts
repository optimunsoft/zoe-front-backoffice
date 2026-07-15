import { nextTick, onBeforeUnmount, ref } from 'vue'

const POP_ANIMATION_MS = 420
const COPIED_FEEDBACK_MS = 1600

/**
 * Copia teléfono al portapapeles, anima el control clicado y muestra feedback en el badge.
 */
export const useCopyPhoneNumber = () => {
  const animatingKey = ref<string | null>(null)
  const copiedKey = ref<string | null>(null)
  let animationTimer: ReturnType<typeof setTimeout> | null = null
  let copiedTimer: ReturnType<typeof setTimeout> | null = null
  let animationToken = 0
  let copiedToken = 0

  const resolveKey = (key: string | number | null | undefined) => {
    if (key == null) return null
    const normalized = String(key).trim()
    return normalized || null
  }

  const clearAnimation = () => {
    if (animationTimer) {
      clearTimeout(animationTimer)
      animationTimer = null
    }
    animatingKey.value = null
  }

  const clearCopiedFeedback = () => {
    if (copiedTimer) {
      clearTimeout(copiedTimer)
      copiedTimer = null
    }
    copiedKey.value = null
  }

  const isPhoneAnimating = (key: string | number | null | undefined) => {
    const resolved = resolveKey(key)
    return resolved != null && animatingKey.value === resolved
  }

  const isPhoneCopied = (key: string | number | null | undefined) => {
    const resolved = resolveKey(key)
    return resolved != null && copiedKey.value === resolved
  }

  const playCopyAnimation = async (key: string) => {
    const token = ++animationToken

    animatingKey.value = null
    await nextTick()
    if (token !== animationToken) return

    animatingKey.value = key

    if (animationTimer) clearTimeout(animationTimer)
    animationTimer = setTimeout(() => {
      if (token !== animationToken) return
      animatingKey.value = null
      animationTimer = null
    }, POP_ANIMATION_MS)
  }

  const showCopiedFeedback = (key: string) => {
    const token = ++copiedToken
    copiedKey.value = key

    if (copiedTimer) clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      if (token !== copiedToken) return
      copiedKey.value = null
      copiedTimer = null
    }, COPIED_FEEDBACK_MS)
  }

  const copyPhoneNumber = async (
    phone: string,
    key?: string | number | null,
  ) => {
    const normalized = phone.trim()
    if (!normalized) return false

    const targetKey = resolveKey(key) ?? normalized

    try {
      await navigator.clipboard.writeText(normalized)
      await playCopyAnimation(targetKey)
      showCopiedFeedback(targetKey)
      return true
    } catch {
      clearAnimation()
      clearCopiedFeedback()
      return false
    }
  }

  onBeforeUnmount(() => {
    clearAnimation()
    clearCopiedFeedback()
  })

  return {
    isPhoneAnimating,
    isPhoneCopied,
    copyPhoneNumber,
  }
}
