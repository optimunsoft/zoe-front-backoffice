import type { ApiResponse } from '~/shared/interfaces/api';

export interface Municipality {
  id: string;
  name: string;
  state: {
    id: string;
    name: string;
  };
}

export interface GetMunicipalitiesRequest {
  countryId?: string;
  name?: string;
  id?: string;
}

export type GetMunicipalitiesResponse = ApiResponse<Municipality[]>;
