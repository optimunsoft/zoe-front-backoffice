import type { DeleteUsersDemoResponse } from '../types/users-demo.types'

export const useUsersDemoService = () => {
  const { $apiBackoffice } = useNuxtApp()

  const deleteUsersDemo = async (userId: string): Promise<DeleteUsersDemoResponse> => {
    return $apiBackoffice<DeleteUsersDemoResponse>(`administration/users/${userId}/demo`, {
      method: 'DELETE',
    })
  }

  return {
    deleteUsersDemo,
  }
}
