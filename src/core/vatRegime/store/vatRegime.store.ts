import { defineStore } from 'pinia'
import { capitalizeFirstLetter } from '~/shared/utils/format'
import type { VatRegime } from '~/core/vatRegime/types/vatRegime.interface'
import { useVatRegimeService } from '~/core/vatRegime/services/vatRegime.service'

export const useVatRegimeStore = defineStore('vatRegime', () => {
  const vatRegimeSvc = useVatRegimeService()

  const vatRegimes = ref<VatRegime[]>([])

  const setVatRegimes = (payload: VatRegime[]) => {
    vatRegimes.value = payload.map((item) => ({
      ...item,
      name: capitalizeFirstLetter(item.name),
    }))
  }

  const getVatRegimes = async (force = false) => {
    if (vatRegimes.value.length > 0 && !force) return

    try {
      const { response } = await vatRegimeSvc.getVatRegimes()
      setVatRegimes(response || [])
    } catch {
      vatRegimes.value = []
    }
  }

  const clear = () => {
    vatRegimes.value = []
  }

  return {
    vatRegimes,
    getVatRegimes,
    clear,
  }
})
