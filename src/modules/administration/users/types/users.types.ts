import type { ApiResponse } from '~/shared/interfaces/api';

export type GetUsersParams = {
    amount: number;
    page: number;
};

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    userType: string;
    isActive: boolean;
    isVerified: boolean;
    isAdmin: boolean;
}

export type PaginatedUsersResponse = {
    data?: User[];
    items?: User[];
    users?: User[];
    total?: number;
    page?: number;
    amount?: number;
    totalPages?: number;
};

export type GetUsersResponse = ApiResponse<User[] | PaginatedUsersResponse>;
