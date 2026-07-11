import { defineStore } from 'pinia';
import { ref } from 'vue';

import { useUsersService } from '../services/users.services';
import type { GetUsersParams, PaginatedUsersResponse, UserList, UserRequestBody, UserUpdate } from '../types/users.types';

export const useUsersStore = defineStore('users', () => {
    const users = ref<UserList[]>([]);
    const total = ref(0);
    const page = ref(1);
    const amount = ref(10);

    const normalizeUserListItem = (user: UserList): UserList => {
        if (user.accounts?.length) return user

        const account = user.account
        if (!account) return user

        const accounts = Array.isArray(account) ? account : [account]
        return { ...user, accounts }
    };

    const normalizeResponse = (response: UserList[] | PaginatedUsersResponse): { users: UserList[]; total: number } => {
        if (Array.isArray(response)) {
            const users = response.map(normalizeUserListItem);
            return { users, total: users.length };
        }

        const data = response.data ?? response.items ?? response.users ?? [];
        const users = data.map(normalizeUserListItem);
        return {
            users,
            total: response.total ?? users.length,
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

    const createUser = async (user: UserRequestBody) => {
        const { response } = await useUsersService().createUser(user);
        return response;
    }

    const updateUser = async (userId: string, user: UserUpdate) => {
        const { response } = await useUsersService().updateUser(userId, user);
        return response;
    }

    const changesStatusUser = async (userId: string, status: boolean) => {
        const { response } = await useUsersService().changesStatusUser(userId, status);
        return response;
    }

    const changesStatusDemoUser = async (accountId: string, demo: boolean) => {
        const { response } = await useUsersService().changesStatusDemoUser(accountId, demo);
        return response;
    }
    return {
        users,
        total,
        page,
        amount,
        getUsers,
        createUser,
        updateUser,
        changesStatusUser,
        changesStatusDemoUser,
    }
})
