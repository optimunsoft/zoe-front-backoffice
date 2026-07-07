import type { CompanyRequestBody, CompanyUpdateRequestBody, GetCompaniesParams, GetCompaniesResponse, GetCompanyPermissionsResponse } from '../types/company.types'

export const useCompanyService = () => {
    const { $apiBackoffice } = useNuxtApp();

    const getCompanies = (params: GetCompaniesParams): Promise<GetCompaniesResponse> => {
        const query: Record<string, string | number> = {
            amount: params.amount,
            page: params.page,
        }

        const search = params.search?.trim()
        if (search) query.search = search

        const municipalityId = params.municipalityId?.trim()
        if (municipalityId) query.municipalityId = municipalityId

        const stateId = params.stateId?.trim()
        if (stateId) query.stateId = stateId

        return $apiBackoffice<GetCompaniesResponse>('administration/companies/list', {
            method: 'GET',
            query,
        });
    }

    const createCompany = (company: CompanyRequestBody): Promise<GetCompaniesResponse> => {
        return $apiBackoffice<GetCompaniesResponse>('/administration/companies/create', {
            method: 'POST',
            body: company,
        });
    }

    const updateCompany = (id: string, company: CompanyUpdateRequestBody): Promise<GetCompaniesResponse> => {
        return $apiBackoffice<GetCompaniesResponse>(`administration/companies/edit/${id}`, {
            method: 'PUT',
            body: company,
        });
    }

    const getCompanyPermissions = (companyId: string, roleId: string): Promise<GetCompanyPermissionsResponse> => {
        return $apiBackoffice<GetCompanyPermissionsResponse>(`administration/companies/${companyId}/roles/${roleId}`, {
            method: 'GET',
        });
    }

    return {
        getCompanies,
        createCompany,
        updateCompany,
        getCompanyPermissions,
    }
}
