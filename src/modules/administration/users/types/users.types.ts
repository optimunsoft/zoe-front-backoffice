import type { ApiResponse } from '~/shared/interfaces/api';

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
}


export interface UserAccount {
    id: string;
    accountNumber: string;
    accountType: string;
    accountBalance: number;
    accountStatus: string;
    accountCreatedAt: string;
}


export interface UserSession {
    id: string;
    loginAt: string;
    logoutAt: string | null;
    device: string | null;
    browser: string | null;
    operatingSystem: string | null;
    ip: string | null;
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
    accounts?: UserAccount[];
    sessions?: UserSession[];
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

export interface UserUpdate extends UserBase {
    password?: string;
}



export type GetUsersResponse = ApiResponse<UserList[] | PaginatedUsersResponse>;
export type UserRequestBody = UserCreate;
