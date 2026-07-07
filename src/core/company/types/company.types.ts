import type { ApiResponse } from '~/shared/interfaces/api';

export type GetCompaniesParams = {
  amount: number;
  page: number;
  search?: string;
  municipalityId?: string;
  stateId?: string;
}

export interface roleUserCompany {
  id: string;
  name: string;

}

export type userCompany = {
  id: string;
  userType: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isDeleted: boolean;
  isOwner: boolean;
  roles: roleUserCompany[];
}


export interface userCompanyPermissions {
  id: string;
  module: string;
  resource: string;
  action: string;
  name: string;
  description: string | null;
}

export interface CompanyRolePermissions {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: userCompanyPermissions[];
}


export interface stateMunicipality {
  id: string;
  code: string;
  name: string;
}

export interface companyMunicipality {
    id: string;
    code: string;
    name: string;
    state: stateMunicipality;
}

export interface generalInformationCompany {
  businessNatureId: string;
  taxResponsibilityId: string;
  vatRegimeId: string;
  documentTypeId: string;
  municipality: companyMunicipality;
  documentNumber: string;
  businessName: string;
  tradeName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  email: string;
  accountantName: string;
  professionalCard: string;
  address: string;
}

export interface CompanyList extends generalInformationCompany {
  id: string;
  hasApiKey: boolean;
  users: userCompany[];
}

/** Alias usado en formularios y mappers. */
export type Company = CompanyList;

export interface CompanyCreate extends Omit<generalInformationCompany, 'municipality'> {
  ownerUserId: string;
  municipalityId: string;
}

export interface CompanyUpdate extends Omit<generalInformationCompany, 'municipality'> {
  municipalityId: string;
}

export type PaginatedCompaniesResponse = {
  data?: CompanyList[];
  items?: CompanyList[];
  companies?: CompanyList[];
  total?: number;
  page?: number;
  amount?: number;
  totalPages?: number;
}

export type GetCompaniesResponse = ApiResponse<CompanyList[] | PaginatedCompaniesResponse>;
export type GetCompanyPermissionsResponse = ApiResponse<CompanyRolePermissions>;
export type CompanyRequestBody = CompanyCreate;
export type CompanyUpdateRequestBody = CompanyUpdate;
