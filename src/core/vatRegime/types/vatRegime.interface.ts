import type { ApiResponse } from '~/shared/interfaces/api'

export interface VatRegime {
  id: string
  code: string
  name: string
}

export type GetVatRegimesResponse = ApiResponse<VatRegime[]>
