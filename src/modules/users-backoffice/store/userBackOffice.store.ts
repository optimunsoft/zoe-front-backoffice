import { defineStore } from 'pinia'

import { useUserBackofficeService } from '../services/userBackoffice.services'
import type {
  UserBackofficeCreate,
  UserBackofficeUpdate,
  UserList,
} from '../types/userBackoffice.types'

export const useUserBackofficeStore = defineStore('userBackoffice', () => {
  const createUser = async (user: UserBackofficeCreate): Promise<UserList> => {
    const { response } = await useUserBackofficeService().createUser(user)
    return response
  }

  const updateUser = async (userId: string, user: UserBackofficeUpdate): Promise<UserList> => {
    const { response } = await useUserBackofficeService().updateUser(userId, user)
    return response
  }

  return {
    createUser,
    updateUser,
  }
})
