import type { GetTaxResponsibilitiesResponse } from '~/core/taxResponsibility/types/taxResponsibility.interface';

export const useTaxResponsibilityService = () => {
  const { $apiCore } = useNuxtApp();

  const getTaxResponsibilities = (): Promise<GetTaxResponsibilitiesResponse> => {
    return $apiCore<GetTaxResponsibilitiesResponse>('tax-responsibilities', {
      method: 'GET',
    });
  };

  return {
    getTaxResponsibilities,
  };
};
