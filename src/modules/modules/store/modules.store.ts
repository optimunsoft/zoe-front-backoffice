import { defineStore } from 'pinia'
import { ref } from 'vue'

import { normalizeModulesListResponse } from '../mappers/module-table.mapper'
import { useModulesService } from '../services/modules.services'
import type { GetModulesParams, Module, ModuleList } from '../types/modules.types'

export const useModulesStore = defineStore('modules', () => {
  const modules = ref<ModuleList[]>([])
  const search = ref('')
  const isLoading = ref(false)
  const cachedLists = ref<Record<string, ModuleList[]>>({})
  const pendingRequests = new Map<string, Promise<void>>()

  const buildCacheKey = (params: GetModulesParams = {}) =>
    params.search?.trim() ?? ''

  const buildRequestParams = (): GetModulesParams => {
    const trimmedSearch = search.value.trim()
    return trimmedSearch ? { search: trimmedSearch } : {}
  }

  const invalidateCache = () => {
    cachedLists.value = {}
    pendingRequests.clear()
  }

  const getModules = async (params: GetModulesParams = {}, force = false) => {
    const cacheKey = buildCacheKey(params)
    search.value = cacheKey

    if (!force && cachedLists.value[cacheKey]) {
      modules.value = cachedLists.value[cacheKey]
      return
    }

    const pendingRequest = pendingRequests.get(cacheKey)
    if (!force && pendingRequest) {
      await pendingRequest
      return
    }

    const request = (async () => {
      const { response } = await useModulesService().getModules(params)
      const normalized = normalizeModulesListResponse(response)

      modules.value = normalized
      cachedLists.value[cacheKey] = normalized
    })()

    pendingRequests.set(cacheKey, request)

    try {
      await request
    } finally {
      pendingRequests.delete(cacheKey)
    }
  }

  const fetchModules = async (force = false) => {
    if (isLoading.value && !force) return

    isLoading.value = true

    try {
      await getModules(buildRequestParams(), force)
    } finally {
      isLoading.value = false
    }
  }

  const getModuleFromList = (id: string) => {
    const normalizedId = id.trim()
    if (!normalizedId) return null

    return modules.value.find((item) => String(item.id) === normalizedId) ?? null
  }

  const clearModuleLists = () => {
    modules.value = []
    search.value = ''
    invalidateCache()
  }

  const createModule = async (payload: Module) => {
    const result = await useModulesService().createModule(payload)
    invalidateCache()
    return result
  }

  const updateModule = async (id: string, payload: Module) => {
    const result = await useModulesService().updateModule(id, payload)
    invalidateCache()
    return result
  }

  const deleteModule = async (id: string) => {
    await useModulesService().deleteModule(id)
    invalidateCache()
    modules.value = modules.value.filter((item) => item.id !== id)
  }

  return {
    modules,
    search,
    isLoading,
    getModules,
    fetchModules,
    getModuleFromList,
    createModule,
    updateModule,
    deleteModule,
    clearModuleLists,
  }
})
