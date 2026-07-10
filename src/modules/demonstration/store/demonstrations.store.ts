import { defineStore } from 'pinia';
import { ref } from 'vue';
import { normalizeDemonstrationsListResponse } from '../schema/demonstrations.schema';
import { useDemonstrationService } from '../services/demonstration.services';
import type { Demonstration, DemonstrationResponse, UpdateDemonstration } from '../types/demonstration.types';

export const useDemonstrationsStore = defineStore('demonstrations', () => {
    const demonstrations = ref<DemonstrationResponse[]>([]);
    const total = ref(0);
    const page = ref(1);
    const amount = ref(10);

    const getDemonstrations = async (params: { amount: number, page: number }) => {
        page.value = params.page;
        amount.value = params.amount;

        const { response } = await useDemonstrationService().getDemonstrations(params);
        const normalized = normalizeDemonstrationsListResponse(response);

        demonstrations.value = normalized.demonstrations;
        total.value = normalized.total;
    }

    const getDemonstrationById = async (id: string) => {
        const { response } = await useDemonstrationService().getDemonstrationById(id);
        return response;
    }


    const createDemonstration = async (params: Demonstration) => {
        const { response } = await useDemonstrationService().createDemonstration(params);
        return response;
    }

    const UpdateDemonstration =  async(id: string, params: UpdateDemonstration) => {
        const { response } = await useDemonstrationService().updateDemonstration(id, params);
        return response;
    }

    const deleteDemonstration = async (id: string) => {
        await useDemonstrationService().deleteDemonstration(id);
    }

    return {
        demonstrations,
        total,
        page,
        amount,
        getDemonstrations,
        getDemonstrationById,
        createDemonstration,
        UpdateDemonstration,
        deleteDemonstration,
    }
})