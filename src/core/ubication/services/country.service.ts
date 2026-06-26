import { buildQueryParams } from '~/shared/utils/build-query-params';
import type {
  GetCountriesAvailableResponse,
  GetCountriesRequest,
  GetCountriesResponse,
} from '~/core/ubication/types/country.interface';

export const useCountryService = () => {
  const { $apiCore } = useNuxtApp();

  const getAvailable = (): Promise<GetCountriesAvailableResponse> => {
    return $apiCore<GetCountriesAvailableResponse>('countries/getAvailable', {
      method: 'GET',
    });
  };

  const search = (request: GetCountriesRequest): Promise<GetCountriesResponse> => {
    const queryString = buildQueryParams({
      name: request.name,
      id: request.id,
    });

    return $apiCore<GetCountriesResponse>(`countries/search?${queryString}`, {
      method: 'GET',
    });
  };

  const getAll = (): Promise<GetCountriesResponse> => {
    return $apiCore<GetCountriesResponse>('countries/getAll', {
      method: 'GET',
    });
  };

  return {
    getAvailable,
    search,
    getAll,
  };
};
