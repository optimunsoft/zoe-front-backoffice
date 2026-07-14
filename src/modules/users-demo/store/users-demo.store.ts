import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { UserList } from '~/modules/administration/users/types/users.types'
import { useUsersDemoService } from '../services/users-demo.services'
import type { DeleteUsersDemoResult } from '../types/users-demo.types'

export const useUsersDemoStore = defineStore('users-demo', () => {
  const usersDemo = ref<UserList[]>([])
  const total = ref(0)
  const page = ref(1)
  const amount = ref(10)

  const deleteUsersDemo = async (userId: string): Promise<DeleteUsersDemoResult | undefined> => {
    const { response, status } = await useUsersDemoService().deleteUsersDemo(userId)

    if (status && response?.deleted) {
      usersDemo.value = usersDemo.value.filter((user) => user.id !== userId)
      total.value = Math.max(0, total.value - 1)
    }

    return response
  }

  return {
    usersDemo,
    total,
    page,
    amount,
    deleteUsersDemo,
  }
})
