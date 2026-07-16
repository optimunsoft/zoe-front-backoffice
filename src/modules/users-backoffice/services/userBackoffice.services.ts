import type {
  GetUsersResponse,
  UserBackofficeCreate,
  UserBackofficeUpdate,
} from '../types/userBackoffice.types'

export const useUserBackofficeService = () => {
  const { $apiBackoffice } = useNuxtApp()

  const createUser = async (user: UserBackofficeCreate): Promise<GetUsersResponse> => {
    return $apiBackoffice<GetUsersResponse>('administration/users/create-backoffice', {
      method: 'POST',
      body: user,
    })
  }

  const updateUser = async (
    userId: string,
    user: UserBackofficeUpdate,
  ): Promise<GetUsersResponse> => {
    return $apiBackoffice<GetUsersResponse>(`administration/users/backoffice/edit/${userId}`, {
      method: 'PUT',
      body: user,
    })
  }

  return {
    createUser,
    updateUser,
  }
}
