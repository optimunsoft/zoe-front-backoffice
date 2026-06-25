import { defineStore } from 'pinia'
import { ref } from 'vue'

export type CompanySummary = {
  id: string
  name?: string
}

export const useCompanyStore = defineStore('company', () => {
  const currentCompany = ref<CompanySummary | null>(null)

  const clearCompanyLists = () => {
    currentCompany.value = null
  }

  return {
    currentCompany,
    clearCompanyLists,
  }
})
