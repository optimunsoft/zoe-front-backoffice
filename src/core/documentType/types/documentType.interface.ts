import type { ApiResponse } from '~/shared/interfaces/api';

export interface DocumentType {
  id: string;
  code: string;
  name: string;
}

export type GetDocumentTypesResponse = ApiResponse<DocumentType[]>;
