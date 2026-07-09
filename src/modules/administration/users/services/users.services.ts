import type { GetUsersParams, GetUsersResponse, UserRequestBody, UserUpdate } from '../types/users.types';

 export const useUsersService = () => {
    const { $apiBackoffice } = useNuxtApp();

    const getUsers = async (params: GetUsersParams): Promise<GetUsersResponse> => {
        const query: Record<string, string | number | boolean> = {
            amount: params.amount,
            page: params.page,
        }

        const search = params.search?.trim()
        if (search) query.search = search

        const companyId = params.companyId?.trim()
        if (companyId) query.companyId = companyId

        if (params.isAdmin !== undefined) query.isAdmin = params.isAdmin
        if (params.isDemo !== undefined) query.isDemo = params.isDemo

        const type = params.type?.trim()
        if (type) query.type = type

        return $apiBackoffice<GetUsersResponse>('administration/users/list', {
            method: 'GET',
            query,
        });
    }

    const createUser = async (user: UserRequestBody): Promise<GetUsersResponse> => {
        return $apiBackoffice<GetUsersResponse>('administration/users/create', {
            method: 'POST',
            body: user,
        });
    }

    const updateUser = async (userId: string, user: UserUpdate): Promise<GetUsersResponse> => {
        return $apiBackoffice<GetUsersResponse>(`administration/users/edit/${userId}`, {
            method: 'PUT',
            body: user,
        });
    }

    const changesStatusUser = async (userId: string, status: boolean): Promise<GetUsersResponse> => {
        return $apiBackoffice<GetUsersResponse>(`administration/users/${userId}/status`, {
            method: 'PUT',
            body: { active: status },
        });
    }


    const changesStatusDemoUser = async (userId: string, demo: boolean): Promise<GetUsersResponse> => {
        return $apiBackoffice<GetUsersResponse>(`administration/users/${userId}/demo`, {
            method: 'PUT',
            body: { isDemo: demo },
        });
    }





    return {
        getUsers,
        createUser,
        updateUser,
        changesStatusUser,
        changesStatusDemoUser,
    }
}
