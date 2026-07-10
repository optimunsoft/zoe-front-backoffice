import { defineStore } from 'pinia';
import { ref } from 'vue';

import { useUsersService } from '../services/users.services';
import type { GetUsersParams, PaginatedUsersResponse, UserList, UserRequestBody, UserUpdate } from '../types/users.types';

export const useUsersStore = defineStore('users', () => {
    const users = ref<UserList[]>([]);
    const total = ref(0);
    const page = ref(1);
    const amount = ref(10);
    const cachedPages = ref<Record<string, { users: UserList[]; total: number }>>({});
    const pendingRequests = new Map<string, Promise<void>>();

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

    const queryFilters = ref<Pick<GetUsersParams, 'search' | 'companyId' | 'isAdmin' | 'isDemo' | 'type'>>({});

    const buildCacheKey = (params: GetUsersParams) =>
        `${params.page}:${params.amount}:${params.search ?? ''}:${params.companyId ?? ''}:${params.isAdmin ?? ''}:${params.isDemo ?? ''}:${params.type ?? ''}`;

    const getUsers = async (params: GetUsersParams, force = false) => {
        const mergedParams: GetUsersParams = {
            page: params.page,
            amount: params.amount,
            search: 'search' in params ? params.search : queryFilters.value.search,
            companyId: 'companyId' in params ? params.companyId : queryFilters.value.companyId,
            isAdmin: 'isAdmin' in params ? params.isAdmin : queryFilters.value.isAdmin,
            isDemo: 'isDemo' in params ? params.isDemo : queryFilters.value.isDemo,
            type: 'type' in params ? params.type : queryFilters.value.type,
        };

        queryFilters.value = {
            search: mergedParams.search,
            companyId: mergedParams.companyId,
            isAdmin: mergedParams.isAdmin,
            isDemo: mergedParams.isDemo,
            type: mergedParams.type,
        };

        const cacheKey = buildCacheKey(mergedParams);
        page.value = mergedParams.page;
        amount.value = mergedParams.amount;

        if (!force && cachedPages.value[cacheKey]) {
            users.value = cachedPages.value[cacheKey].users;
            total.value = cachedPages.value[cacheKey].total;
            return;
        }

        const pendingRequest = pendingRequests.get(cacheKey);
        if (!force && pendingRequest) {
            await pendingRequest;
            return;
        }

        const request = (async () => {
            const { response } = await useUsersService().getUsers(mergedParams);
            const normalized = normalizeResponse(response);

            users.value = normalized.users;
            total.value = normalized.total;
            cachedPages.value[cacheKey] = normalized;
        })();

        pendingRequests.set(cacheKey, request);

        try {
            await request;
        } finally {
            pendingRequests.delete(cacheKey);
        }
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
        cachedPages,
        getUsers,
        createUser,
        updateUser,
        changesStatusUser,
        changesStatusDemoUser,
    }
})
