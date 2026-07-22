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


export interface CompanyModule {
  moduleId: string;
  code: string;
  name: string;
  status: string;
}

export interface CompanyList extends generalInformationCompany {
  id: string;
  hasApiKey: boolean;
  isActive: boolean;
  modules: CompanyModule[];
  users: userCompany[];
  production: boolean;
}

/** Alias usado en formularios y mappers. */
export type Company = CompanyList;

export interface CompanyCreate extends Omit<generalInformationCompany, 'municipality'> {
  ownerUserId: string;
  municipalityId: string;
  production: boolean ;
}

export interface CompanyUpdate extends Omit<generalInformationCompany, 'municipality'> {
  municipalityId: string;
  production: boolean;
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


export type AssignUsersCompany = {
  companyId: string;
  userId: string;
  isOwner: boolean;
}


export enum ActiveModule {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  SOLO_LECTURA = 'SOLO_LECTURA',
}
export type UploadLogo = {
  message: string;
  logoName: string;
}

export type CompanyLogo = {
  logo: string;
}

export type AssignUsersCompanyRequest = AssignUsersCompany

export type AssignUsersCompanyResponse = ApiResponse<AssignUsersCompany>;

export type UploadLogoResponse = ApiResponse<UploadLogo>;
export type GetCompanyLogoResponse = ApiResponse<CompanyLogo>;
export type GetCompaniesResponse = ApiResponse<CompanyList[] | PaginatedCompaniesResponse>;
export type GetCompanyPermissionsResponse = ApiResponse<CompanyRolePermissions>;
export type CompanyRequestBody = CompanyCreate;
export type CompanyUpdateRequestBody = CompanyUpdate;
