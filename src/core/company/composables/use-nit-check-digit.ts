import { watch, type Ref } from 'vue'

import { getNITCheckDigit } from '../utils/nit-check-digit'

type UseNitCheckDigitOptions = {
  onDigitChange?: (digit: string) => void
}

export const useNitCheckDigit = (
  documentNumber: Ref<string>,
  options: UseNitCheckDigitOptions = {},
) => {
  watch(
    documentNumber,
    (value) => {
      const digit = value.trim() ? getNITCheckDigit(value) : ''
      options.onDigitChange?.(digit)
    },
    { immediate: true },
  )
}
