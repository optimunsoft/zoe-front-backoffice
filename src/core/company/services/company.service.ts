import type { GetCompaniesParams, GetCompaniesResponse } from '../types/company.types'

export const useCompanyService = () => {
    const { $apiBackoffice } = useNuxtApp();

    const getCompanies = (params: GetCompaniesParams): Promise<GetCompaniesResponse> => {
        return $apiBackoffice<GetCompaniesResponse>('administration/companies/list', {
            method: 'GET',
            query: {
                amount: params.amount,
                page: params.page,
            },
        });
    }

    return {
        getCompanies,
    }
}
