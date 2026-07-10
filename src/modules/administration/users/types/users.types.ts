import type { ApiResponse } from '~/shared/interfaces/api';
import type { Municipality } from '~/core/ubication/types/municipality.interface';

export const USER_TYPE = {
    USUARIO: 'USUARIO',
    SUBUSUARIO: 'SUBUSUARIO',
} as const

export type UserType = typeof USER_TYPE[keyof typeof USER_TYPE]

export const BACKOFFICE_ROLE = {
    OPERARIO: 'OPERARIO',
    ADMINISTRADOR: 'ADMINISTRADOR',
} as const

export type BackofficeRole = typeof BACKOFFICE_ROLE[keyof typeof BACKOFFICE_ROLE]

export type GetUsersParams = {
    amount: number;
    page: number;
    search?: string;
    companyId?: string;
    isAdmin?: boolean;
    isDemo?: boolean;
    type?: UserType | string;
};
export interface UserBase {
    email: string;
    firstName: string;
    lastName: string;
    municipalityId: string;
    birthDate: string;
    phonePrefix: string;
    phoneNumber: string;
    backofficeRole?: string;
    isVerified: boolean;
    isAdmin: boolean;
    isDemo: boolean;
}

export interface UserCompany {
    id: string;
    documentNumber: string;
    businessName: string;
    tradeName: string | null;
    email: string;
    isOwner: boolean;
    roles: {
        id: string;
        name: string;
    }[]
}

export interface UserAccount {
    id: string;
    code: string;
    isActive: boolean;
    isDeleted: boolean;
    isDemo: boolean;
    createdAt: string;
}


export interface UserSession {
    id: string;
    loginAt: string;
    logoutAt: string | null;
    device: string | null;
    browser: string;
    operatingSystem: string;
    ip: string;
    country: string | null;
    city: string | null;
    refreshCount: number;
    accessExpiresAt: string;
    refreshExpiresAt: string | null;
    revoked: boolean;
    revokedAt: string | null;
}

export interface UserList extends UserBase {
    id: string;
    username: string;
    userType: string;
    isActive: boolean;
    createdAt?: string;
    companies?: UserCompany[];
    account?: UserAccount | UserAccount[];
    accounts?: UserAccount[];
    sessions?: UserSession[];
    birthDate: string;
    municipalityId: string;
    municipality?: Municipality;
    phonePrefix: string;
    phoneNumber: string;
}

export type User = UserList;

export type PaginatedUsersResponse = {
    data?: UserList[];
    items?: UserList[];
    users?: UserList[];
    total?: number;
    page?: number;
    amount?: number;
    totalPages?: number;
};


export interface UserCreate extends UserBase {
    password: string;
    userType: UserType;
}

export type UserUpdate = Omit<UserBase, 'isDemo'>



export type GetUsersResponse = ApiResponse<UserList[] | PaginatedUsersResponse>;
export type UserRequestBody = UserCreate;
