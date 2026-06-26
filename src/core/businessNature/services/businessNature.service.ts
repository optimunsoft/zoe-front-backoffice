import type { GetBusinessNaturesResponse } from '~/core/businessNature/types/businessNature.interface';

export const useBusinessNatureService = () => {
  const { $apiCore } = useNuxtApp();

  const getBusinessNatures = (): Promise<GetBusinessNaturesResponse> => {
    return $apiCore<GetBusinessNaturesResponse>('business-natures', {
      method: 'GET',
    });
  };

  return {
    getBusinessNatures,
  };
};
