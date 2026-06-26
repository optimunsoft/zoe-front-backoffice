import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useCompanyService } from '../services/company.service'
import type { Company, GetCompaniesParams, PaginatedCompaniesResponse } from '../types/company.types'

export type CompanySummary = {
  id: string
  name?: string
}

export const useCompanyStore = defineStore('company', () => {
  const currentCompany = ref<CompanySummary | null>(null)
  const companies = ref<Company[]>([])
  const total = ref(0)
  const page = ref(1)
  const amount = ref(10)

  const normalizeResponse = (response: Company[] | PaginatedCompaniesResponse): { companies: Company[]; total: number } => {
    if (Array.isArray(response)) {
      return { companies: response, total: response.length }
    }

    const data = response.data ?? response.items ?? response.companies ?? []
    return {
      companies: data,
      total: response.total ?? data.length,
    }
  }

  const getCompanies = async (params: GetCompaniesParams) => {
    page.value = params.page
    amount.value = params.amount

    const { response } = await useCompanyService().getCompanies(params)
    const normalized = normalizeResponse(response)

    companies.value = normalized.companies
    total.value = normalized.total
  }

  const clearCompanyLists = () => {
    currentCompany.value = null
  }

  return {
    currentCompany,
    clearCompanyLists,
    getCompanies,
    companies,
    total,
    page,
    amount,
  }
})
