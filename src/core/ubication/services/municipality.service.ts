import { buildQueryParams } from '~/shared/utils/build-query-params';
import type {
  GetMunicipalitiesRequest,
  GetMunicipalitiesResponse,
} from '~/core/ubication/types/municipality.interface';

export const useMunicipalityService = () => {
  const { $apiCore } = useNuxtApp();

  const search = (request: GetMunicipalitiesRequest): Promise<GetMunicipalitiesResponse> => {
    const queryString = buildQueryParams({
      countryId: request.countryId,
      name: request.name,
      id: request.id,
    });

    return $apiCore<GetMunicipalitiesResponse>(`municipalities/search?${queryString}`, {
      method: 'GET',
    });
  };

  return {
    search,
  };
};
