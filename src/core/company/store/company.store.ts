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

  const normalizeResponse = (response: CompanyList[] | PaginatedCompaniesResponse | Record<string, unknown>): { companies: CompanyList[]; total: number } => {
    if (Array.isArray(response)) {
      return {
        companies: response.map((item) => normalizeCompanyListItem(item)),
        total: response.length,
      }
    }

    const record = response as Record<string, unknown>
    const nestedCompany = record.company ?? record.item ?? record.result
    if (nestedCompany && typeof nestedCompany === 'object' && !Array.isArray(nestedCompany)) {
      const company = normalizeCompanyListItem(nestedCompany as CompanyList)
      return { companies: [company], total: 1 }
    }

    if (record.id || record.companyId || record.company_id) {
      const company = normalizeCompanyListItem(response as CompanyList)
      return { companies: [company], total: 1 }
    }

    const data = (response as PaginatedCompaniesResponse).data
      ?? (response as PaginatedCompaniesResponse).items
      ?? (response as PaginatedCompaniesResponse).companies
      ?? []

    if (!Array.isArray(data) && data && typeof data === 'object') {
      const company = normalizeCompanyListItem(data as CompanyList)
      return { companies: [company], total: 1 }
    }

    const list = Array.isArray(data) ? data : []

    return {
      companies: list.map((item) => normalizeCompanyListItem(item)),
      total: (response as PaginatedCompaniesResponse).total ?? list.length,
    }
  }

  const buildCompaniesCacheKey = (params: GetCompaniesParams) =>
    [
      params.page,
      params.amount,
      params.search?.trim() ?? '',
      params.municipalityId?.trim() ?? '',
      params.stateId?.trim() ?? '',
      typeof params.production === 'boolean' ? String(params.production) : '',
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

  const createCompany = async (
    company: CompanyRequestBody,
    options?: { skipNotification?: boolean },
  ) => {
    const apiResult = await useCompanyService().createCompany(company, options)
    const normalized = normalizeResponse(apiResult.response as CompanyList[] | PaginatedCompaniesResponse | Record<string, unknown>)
    const created = normalized.companies[0] ?? null

    if (created?.id) return created

    // Fallback: algunas respuestas traen el id en campos anidados o con otro nombre.
    const fallbackId = (() => {
      const response = apiResult.response as unknown
      if (!response || typeof response !== 'object') return null
      const record = response as Record<string, unknown>
      const candidates = [
        record.id,
        record.companyId,
        record.company_id,
        (record.company as Record<string, unknown> | undefined)?.id,
        (record.data as Record<string, unknown> | undefined)?.id,
      ]
      for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
        if (typeof candidate === 'number' && Number.isFinite(candidate)) return String(candidate)
      }
      return null
    })()

    if (!fallbackId) return null

    return {
      ...(created ?? ({} as CompanyList)),
      id: fallbackId,
    }
  }

  const updateCompany = async (id: string, company: CompanyUpdateRequestBody) => {
    const { response } = await useCompanyService().updateCompany(id, company)

    if (typeof company.production === 'boolean') {
      const production = company.production
      const sync = (item: CompanyList) => {
        if (item.id === id) {
          item.production = production
        }
      }

      companies.value.forEach(sync)
      Object.values(cachedPages.value).forEach((cached) => {
        cached.companies.forEach(sync)
      })
    }

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

  const assignModulesToCompany = async (
    companyId: string,
    moduleId: string,
    action: ActiveModule,
    options?: { skipNotification?: boolean },
  ) => {
    const response = await useCompanyService().assignModulesToCompany(
      moduleId,
      companyId,
      action,
      options,
    ).then((result) => result.message)
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

  const getCompanyRut = async (
    file: File,
    options?: { skipNotification?: boolean },
  ) => {
    const { response } = await useCompanyService().getCompanyRut(file, options)
    return response.prefill
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
    getCompanyRut,
  }
})
