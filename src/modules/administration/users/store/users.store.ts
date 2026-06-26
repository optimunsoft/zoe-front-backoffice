import { defineStore } from 'pinia';
import { ref } from 'vue';

import { useUsersService } from '../services/users.services';
import type { GetUsersParams, PaginatedUsersResponse, User } from '../types/users.types';

export const useUsersStore = defineStore('users', () => {
    const users = ref<User[]>([]);
    const total = ref(0);
    const page = ref(1);
    const amount = ref(10);

    const normalizeResponse = (response: User[] | PaginatedUsersResponse): { users: User[]; total: number } => {
        if (Array.isArray(response)) {
            return { users: response, total: response.length };
        }

        const data = response.data ?? response.items ?? response.users ?? [];
        return {
            users: data,
            total: response.total ?? data.length,
        };
    };

    const getUsers = async (params: GetUsersParams) => {
        page.value = params.page;
        amount.value = params.amount;

        const { response } = await useUsersService().getUsers(params);
        const normalized = normalizeResponse(response);

        users.value = normalized.users;
        total.value = normalized.total;
    }
    return {
        users,
        total,
        page,
        amount,
        getUsers,
    }
})
