import { defineStore } from 'pinia'
import { ref } from 'vue'
import { normalizeCompanyListItem } from '../schema/company.schema'
import { normalizeCompanyRolePermissions } from '../schema/company-permissions.schema'
import { useCompanyService } from '../services/company.service'
import type { CompanyList, CompanyRequestBody, CompanyUpdateRequestBody, CompanyRolePermissions, GetCompaniesParams, PaginatedCompaniesResponse } from '../types/company.types'

export type CompanySummary = {
  id: string
  name?: string
}

export const useCompanyStore = defineStore('company', () => {
  const currentCompany = ref<CompanySummary | null>(null)
  const companies = ref<CompanyList[]>([])
  const total = ref(0)
  const page = ref(1)
  const amount = ref(10)
  const cachedPages = ref<Record<string, { companies: CompanyList[]; total: number }>>({})
  const pendingRequests = new Map<string, Promise<void>>()

  const normalizeResponse = (response: CompanyList[] | PaginatedCompaniesResponse): { companies: CompanyList[]; total: number } => {
    if (Array.isArray(response)) {
      return {
        companies: response.map((item) => normalizeCompanyListItem(item)),
        total: response.length,
      }
    }

    const data = response.data ?? response.items ?? response.companies ?? []

    return {
      companies: data.map((item) => normalizeCompanyListItem(item)),
      total: response.total ?? data.length,
    }
  }

  const buildCompaniesCacheKey = (params: GetCompaniesParams) =>
    [
      params.page,
      params.amount,
      params.search?.trim() ?? '',
      params.municipalityId?.trim() ?? '',
      params.stateId?.trim() ?? '',
    ].join(':')

  const getCompanies = async (params: GetCompaniesParams, force = false) => {
    const cacheKey = buildCompaniesCacheKey(params)
    page.value = params.page
    amount.value = params.amount

    if (!force && cachedPages.value[cacheKey]) {
      companies.value = cachedPages.value[cacheKey].companies
      total.value = cachedPages.value[cacheKey].total
      return
    }

    const pendingRequest = pendingRequests.get(cacheKey)
    if (!force && pendingRequest) {
      await pendingRequest
      return
    }

    const request = (async () => {
      const { response } = await useCompanyService().getCompanies(params)
      const normalized = normalizeResponse(response)

      companies.value = normalized.companies
      total.value = normalized.total
      cachedPages.value[cacheKey] = normalized
    })()

    pendingRequests.set(cacheKey, request)

    try {
      await request
    } finally {
      pendingRequests.delete(cacheKey)
    }
  }

  const clearCompanyLists = () => {
    currentCompany.value = null
    companies.value = []
    total.value = 0
    cachedPages.value = {}
    pendingRequests.clear()
  }

  const createCompany = async (company: CompanyRequestBody) => {
    const { response } = await useCompanyService().createCompany(company)
    return response
  }

  const updateCompany = async (id: string, company: CompanyUpdateRequestBody) => {
    const { response } = await useCompanyService().updateCompany(id, company)
    return response
  }

  const getCompanyFromList = (id: string) =>
    companies.value.find((item) => item.id === id) ?? null

  const getCompanyRolePermissions = async (
    companyId: string,
    roleId: string,
  ): Promise<CompanyRolePermissions> => {
    const { response } = await useCompanyService().getCompanyPermissions(companyId, roleId)
    return normalizeCompanyRolePermissions(response)
  }

  return {
    currentCompany,
    clearCompanyLists,
    getCompanies,
    getCompanyFromList,
    getCompanyRolePermissions,
    createCompany,
    updateCompany,
    companies,
    total,
    page,
    amount,
  }
})
