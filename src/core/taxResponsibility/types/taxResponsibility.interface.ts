import type { ApiResponse } from '~/shared/interfaces/api';

export interface TaxResponsibility {
  id: string;
  code: string;
  name: string;
}

export type GetTaxResponsibilitiesResponse = ApiResponse<TaxResponsibility[]>;
