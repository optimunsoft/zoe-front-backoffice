import type { ApiResponse } from '~/shared/interfaces/api';

export interface BusinessNature {
  id: string;
  code: string;
  name: string;
}

export type GetBusinessNaturesResponse = ApiResponse<BusinessNature[]>;
