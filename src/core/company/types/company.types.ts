import type { ApiResponse } from '~/shared/interfaces/api';

export type GetCompaniesParams = {
  amount: number;
  page: number;
}

export interface Company {
  id: string;
  businessNatureId: string;
  taxResponsibilityId: string;
  vatRegimeId: string;
  documentTypeId: string;
  municipalityId: string;
  documentNumber: string;
  businessName: string;
  tradeName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  email: string;
  address: string;
  hasApiKey: boolean;
}

export type PaginatedCompaniesResponse = {
  data?: Company[];
  items?: Company[];
  companies?: Company[];
  total?: number;
  page?: number;
  amount?: number;
  totalPages?: number;
}

export type GetCompaniesResponse = ApiResponse<Company[] | PaginatedCompaniesResponse>;
