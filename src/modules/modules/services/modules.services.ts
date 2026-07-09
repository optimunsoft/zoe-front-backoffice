 import type { GetModulesParams, GetModulesResponse, Module } from '../types/modules.types';

 export const useModulesService = () => {
    const { $apiBackoffice } = useNuxtApp();

    const getModules = (params: GetModulesParams = {}): Promise<GetModulesResponse> => {
        const query: Record<string, string> = {}

        const search = params.search?.trim()
        if (search) query.search = search

        return $apiBackoffice<GetModulesResponse>('administration/modules/list', {
            method: 'GET',
            query,
        });
    }


    const createModule = (module: Module): Promise<GetModulesResponse> => {
        return $apiBackoffice<GetModulesResponse>('administration/modules/create', {
            method: 'POST',
            body: module,
        });
    }

    const updateModule = (moduleId: string, module: Module): Promise<GetModulesResponse> => {
        return $apiBackoffice<GetModulesResponse>(`administration/modules/edit/${moduleId}`, {
            method: 'PUT',
            body: module,
        });
    }
    const deleteModule = (moduleId: string) => {
        return $apiBackoffice<unknown>(`administration/modules/delete/${moduleId}`, {
            method: 'DELETE',
        });
    }


    return {
        getModules,
            createModule,
            updateModule,
            deleteModule,
        }
 }