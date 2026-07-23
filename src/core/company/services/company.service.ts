import type { ApiResponse } from '~/shared/interfaces/api'
import { HEADER_SKIP_NOTIFICATION } from '~/shared/constants/headers'
import type { ActiveModule, AssignUsersCompanyRequest, AssignUsersCompanyResponse, CompanyRequestBody, CompanyUpdateRequestBody, GetCompaniesParams, GetCompaniesResponse, GetCompanyLogoResponse, GetCompanyPermissionsResponse, GetCompanyRutResponse, UploadLogoResponse } from '../types/company.types'

export type GetCompanyStatusResponse = ApiResponse<null>

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

    const createCompany = (
      company: CompanyRequestBody,
      options?: { skipNotification?: boolean },
    ): Promise<GetCompaniesResponse> => {
        return $apiBackoffice<GetCompaniesResponse>('/administration/companies/create', {
            method: 'POST',
            body: company,
            ...(options?.skipNotification
                ? { headers: { [HEADER_SKIP_NOTIFICATION]: '1' } }
                : {}),
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

    const getStatusCompanies = (
      companyId: string,
      active: boolean,
      options?: { skipNotification?: boolean },
    ): Promise<GetCompanyStatusResponse> => {
        return $apiBackoffice<GetCompanyStatusResponse>(`administration/companies/${companyId}/status`, {
            method: 'PATCH',
            body: {
                active: active,
            },
            ...(options?.skipNotification
                ? { headers: { [HEADER_SKIP_NOTIFICATION]: '1' } }
                : {}),
        });
    }

    const assignUsersToCompany = (assignUsersCompany: AssignUsersCompanyRequest): Promise<GetCompanyStatusResponse> => {
        return $apiBackoffice<GetCompanyStatusResponse>('administration/companies/users/assign', {
            method: 'POST',
            body: assignUsersCompany,
        });
    }

    const unassignUsersFromCompany = (
      companyId: string,
      userId: string,
      options?: { skipNotification?: boolean },
    ): Promise<AssignUsersCompanyResponse> => {
        return $apiBackoffice<AssignUsersCompanyResponse>(`administration/companies/users/unassign`, {
            method: 'POST',
            body: {
                companyId: companyId,
                userId: userId,
            },
            ...(options?.skipNotification
                ? { headers: { [HEADER_SKIP_NOTIFICATION]: '1' } }
                : {}),
        });
    }

    const assignModulesToCompany = (
      moduleId: string,
      companyId: string,
      active: ActiveModule,
      options?: { skipNotification?: boolean },
    ): Promise<AssignUsersCompanyResponse> => {
        return $apiBackoffice<AssignUsersCompanyResponse>(`administration/modules/${moduleId}/companies`, {
            method: 'PATCH',
            body: {
                companyId: companyId,
                status: active,
            },
            ...(options?.skipNotification
                ? { headers: { [HEADER_SKIP_NOTIFICATION]: '1' } }
                : {}),
        });
    }

    const uploadCompanyLogo = (
        companyId: string,
        logo: File,
        options?: { skipNotification?: boolean },
    ): Promise<UploadLogoResponse> => {
        const formData = new FormData()
        formData.append('logo', logo)

        return $apiBackoffice<UploadLogoResponse>(`administration/companies/${companyId}/logo`, {
            method: 'POST',
            body: formData,
            ...(options?.skipNotification
                ? { headers: { [HEADER_SKIP_NOTIFICATION]: '1' } }
                : {}),
        })
    }

    const getCompanyLogo = (companyId: string): Promise<GetCompanyLogoResponse> => {
        return $apiBackoffice<GetCompanyLogoResponse>(`administration/companies/${companyId}/logo`, {
            method: 'GET',
        })
    }

    const getCompanyRut = (
      file: File,
      options?: { skipNotification?: boolean },
    ): Promise<GetCompanyRutResponse> => {
        const formData = new FormData()
        formData.append('file', file)

        return $apiBackoffice<GetCompanyRutResponse>('administration/companies/rut/extract-prefill', {
            method: 'POST',
            body: formData,
            ...(options?.skipNotification
                ? { headers: { [HEADER_SKIP_NOTIFICATION]: '1' } }
                : {}),
        })
    }


    return {
        getCompanies,
        createCompany,
        updateCompany,
        getCompanyPermissions,
        getStatusCompanies,
        assignUsersToCompany,
        unassignUsersFromCompany,
        assignModulesToCompany,
        uploadCompanyLogo,
        getCompanyLogo,
        getCompanyRut,
    }
}
