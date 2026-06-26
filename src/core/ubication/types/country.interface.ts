import type { ApiResponse } from '~/shared/interfaces/api';

export interface Country {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  phonePrefix: string;
}

export interface GetCountriesRequest {
  name?: string;
  id?: string;
}

export type GetCountriesResponse = ApiResponse<Country[]>;
export type GetCountriesAvailableResponse = ApiResponse<Country[]>;
