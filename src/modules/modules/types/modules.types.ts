import type { ApiResponse } from '~/shared/interfaces/api';


export interface Module{
    code: string;
    name: string;
    description: string | null;
    price: number | null;
}

export interface ModuleList extends Module
    {
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }


export type GetModulesParams = {
    search?: string;
}

export type GetModulesResponse = ApiResponse<ModuleList[]>;
export type GetModulesListResponse = ApiResponse<ModuleList[]>;