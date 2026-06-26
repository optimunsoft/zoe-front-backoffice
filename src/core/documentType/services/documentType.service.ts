import type { GetDocumentTypesResponse } from '~/core/documentType/types/documentType.interface';

export const useDocumentTypeService = () => {
  const { $apiCore } = useNuxtApp();

  const getDocumentTypes = (): Promise<GetDocumentTypesResponse> => {
    return $apiCore<GetDocumentTypesResponse>('document-types', {
      method: 'GET',
    });
  };

  return {
    getDocumentTypes,
  };
};
