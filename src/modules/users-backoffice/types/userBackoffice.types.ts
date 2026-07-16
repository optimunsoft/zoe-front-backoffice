import type { Municipality } from '~/core/ubication/types/municipality.interface'
import type { ApiResponse } from '~/shared/interfaces/api'

export interface UserBackofficeBase {
  email: string
  firstName: string
  lastName: string
  municipalityId: string
  birthDate: string
  phonePrefix: string
  phoneNumber: string
  backofficeRole: string
}

export interface UserBackofficeCreate extends UserBackofficeBase {
  password: string
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


export interface UserList extends UserBackofficeBase {
    id: string;
    username: string;
    userType: string;
    isActive: boolean;
    createdAt?: string;
    last_login_at: string | null;
    total_sessions: number;
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

export type UserBackofficeUpdate = UserBackofficeBase

export type GetUsersResponse = ApiResponse<UserList>
export type CreateUserBackofficeResponse = GetUsersResponse
export type UpdateUserBackofficeResponse = GetUsersResponse
