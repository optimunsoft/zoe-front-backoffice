import type { GetUsersParams, GetUsersResponse } from '../types/users.types';

 export const useUsersService = () => {
    const { $apiBackoffice } = useNuxtApp();

    const getUsers = async (params: GetUsersParams): Promise<GetUsersResponse> => {
        return $apiBackoffice<GetUsersResponse>('administration/users/list', {
            method: 'GET',
            query: {
                amount: params.amount,
                page: params.page,
            },
        });
    }

    return {
        getUsers,
    }
}
