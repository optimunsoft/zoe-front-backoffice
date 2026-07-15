import { defineStore } from 'pinia'
import { ref } from 'vue'
import { normalizeCompanyListItem } from '../schema/company.schema'
import { normalizeCompanyRolePermissions } from '../schema/company-permissions.schema'
import { useCompanyService } from '../services/company.service'
import type { CompanyList, CompanyRequestBody, CompanyUpdateRequestBody, CompanyRolePermissions, GetCompaniesParams, PaginatedCompaniesResponse, ActiveModule } from '../types/company.types'

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
    const normalized = normalizeResponse(response)
    return normalized.companies[0] ?? null
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

  const getStatusCompanies = async (companyId: string, active: boolean) => {
    const status = await useCompanyService().getStatusCompanies(companyId, active).then((result) => result.status)

    const syncCompanyStatus = (company: CompanyList) => {
      if (company.id === companyId) {
        company.isActive = active
      }
    }

    companies.value.forEach(syncCompanyStatus)

    Object.values(cachedPages.value).forEach((cached) => {
      cached.companies.forEach(syncCompanyStatus)
    })

    return status
  }

  const assignUsersToCompany = async (companyId: string, userIds: string[], isOwner = false) => {
    let lastMessage: string | undefined

    for (const userId of userIds) {
      const { message } = await useCompanyService().assignUsersToCompany({
        companyId,
        userId,
        isOwner,
      })
      lastMessage = message
    }

    return lastMessage
  }

  const unassignUsersFromCompany = async (companyId: string, userId: string) => {
    const response = await useCompanyService().unassignUsersFromCompany(companyId, userId).then((result) => result.message)
    return response
  }

  const assignModulesToCompany = async (companyId: string, moduleId: string, action: ActiveModule) => {
    const response = await useCompanyService().assignModulesToCompany(moduleId, companyId, action).then((result) => result.message)
    return response
  }

  const uploadCompanyLogo = async (
    companyId: string,
    logo: File,
    options?: { skipNotification?: boolean },
  ) => {
    const response = await useCompanyService().uploadCompanyLogo(companyId, logo, options).then((result) => result.message)
    return response
  }

  const getCompanyLogo = async (companyId: string) => {
    const { response } = await useCompanyService().getCompanyLogo(companyId)
    return response.logo
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
    getStatusCompanies,
    assignUsersToCompany,
    unassignUsersFromCompany,
    assignModulesToCompany,
    uploadCompanyLogo,
    getCompanyLogo,
  }
})
