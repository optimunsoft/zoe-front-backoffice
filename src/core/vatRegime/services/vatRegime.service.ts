import type { GetVatRegimesResponse } from '~/core/vatRegime/types/vatRegime.interface'

export const useVatRegimeService = () => {
  const { $apiCore } = useNuxtApp()

  const getVatRegimes = (): Promise<GetVatRegimesResponse> => {
    return $apiCore<GetVatRegimesResponse>('vat-regimes', {
      method: 'GET',
    })
  }

  return {
    getVatRegimes,
  }
}
