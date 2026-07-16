<template>
  <ModalBasic
    id="users-backoffice-assign-companies-modal"
    :modal-open="modalOpen"
    :title="modalTitle"
    description="Asocia empresas al usuario backoffice seleccionado."
    size="2xl"
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
        <UiIcon name="company" size="md" class="text-violet-500" />
      </div>
    </template>

    <div class="space-y-4">
      <p class="text-[14px] font-medium text-gray-500 dark:text-gray-400">
        Buscar empresa
      </p>

      <div ref="companyAnchorRef" class="relative w-full">
        <input
          id="users-backoffice-assign-company-search"
          v-model="companySearch"
          type="text"
          name="companySearch"
          placeholder="Agregar empresa"
          class="form-input min-h-10 w-full pr-10"
          :disabled="isBusy"
          @input="onCompanySearchInput"
          @focus="onCompanySearchFocus"
          @blur="onCompanySearchBlur"
        >
        <button
          type="button"
          class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 transition hover:text-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          :aria-label="assignActionLabel"
          :disabled="isBusy"
          @mousedown.prevent
          @click="confirmAddCompany"
        >
          <Spinner v-if="isBusy" size="sm" />
          <UiIcon v-else name="plus" size="sm" />
        </button>
      </div>

      <Teleport to="body">
        <div
          v-if="showSuggestionsPanel && companyPanelStyle"
          class="fixed max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700/60 dark:bg-gray-800"
          :style="companyPanelStyle"
        >
          <button
            v-for="company in filteredCompanies"
            :key="company.id"
            type="button"
            class="flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-800/60"
            :disabled="isBusy"
            @mousedown.prevent="selectCompanyCandidate(company)"
          >
            <span
              class="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-semibold text-violet-600 dark:bg-violet-500/20 dark:text-violet-300"
            >
              {{ getCompanyInitials(company) }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                {{ formatCompanyLabel(company) }}
              </p>
              <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                {{ company.documentNumber || company.email || company.id }}
              </p>
            </div>
          </button>

          <p
            v-if="isSearchingCompanies"
            class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
          >
            Buscando...
          </p>

          <p
            v-else-if="filteredCompanies.length === 0"
            class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
          >
            No se encontraron empresas con ese criterio.
          </p>
        </div>
      </Teleport>

      <div
        v-if="assignedCompanies.length > 0"
        class="flex max-h-64 flex-col gap-2 overflow-y-auto pe-1"
      >
        <div
          v-for="company in assignedCompanies"
          :key="company.id"
          class="flex items-center justify-between gap-3 rounded-lg bg-sky-50 px-3 py-2.5 dark:bg-sky-500/10"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span
              class="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-sky-700 shadow-sm dark:bg-sky-500/20 dark:text-sky-300"
            >
              {{ getCompanyInitials(company) }}
            </span>
            <div class="min-w-0">
              <div class="flex min-w-0 flex-wrap items-center gap-2">
                <p class="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                  {{ formatCompanyLabel(company) }}
                </p>
                <TableBadge
                  v-if="company.isOwner"
                  color="warning"
                  badge-class="shrink-0"
                >
                  Dueño
                </TableBadge>
              </div>
              <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                {{ company.documentNumber || company.email || company.id }}
              </p>
            </div>
          </div>
          <span
            v-if="pendingCompanyId === company.id"
            class="inline-flex size-8 shrink-0 items-center justify-center text-sky-600 dark:text-sky-300"
          >
            <Spinner size="md" />
          </span>
        </div>
      </div>

      <p
        v-else
        class="w-full rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-sm text-gray-500 dark:border-gray-700/60 dark:text-gray-400"
      >
        No hay empresas asociadas todavía.
      </p>
    </div>

    <template #footer>
      <Button variant="secondary" :disabled="isBusy" @click="handleClose">
        Cerrar
      </Button>
    </template>
  </ModalBasic>

  <ModalAction
    id="confirm-assign-company-modal"
    :modal-open="assignCompanyModalOpen"
    @close-modal="cancelAssignCompany"
  >
    <div class="text-center">
      <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/20">
        <UiIcon name="company" size="md" class="text-violet-500" />
      </div>

      <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
        ¿Asignar empresa?
      </h3>

      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <template v-if="pendingAssignCompany">
          Se asociará
          <span class="font-medium text-gray-700 dark:text-gray-200">
            {{ formatCompanyLabel(pendingAssignCompany) }}
          </span>
          al usuario como dueño.
        </template>
        <template v-else>
          Se asociará la empresa al usuario como dueño.
        </template>
      </p>

      <div class="flex justify-center gap-2">
        <Button variant="secondary" :disabled="isBusy" @click="cancelAssignCompany">
          Cancelar
        </Button>
        <Button variant="primary" :loading="isBusy" @click="confirmAssignCompany">
          Asignar
        </Button>
      </div>
    </div>
  </ModalAction>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

import { useAnchoredOverlay } from '~/core/company/composables/use-anchored-overlay'
import { useCompanyStore } from '~/core/company/store/company.store'
import type { CompanyList } from '~/core/company/types/company.types'
import { TableBadge } from '~/core/ui/badge'
import { Button } from '~/core/ui/buttons'
import { UiIcon } from '~/core/ui/icons'
import { Spinner } from '~/core/ui/loader'
import { ModalAction, ModalBasic } from '~/core/ui/modal'
import { formatUserCompanyName } from '~/modules/administration/users/mappers/user-companies.mapper'
import type { UserCompany, UserList } from '../../types/userBackoffice.types'

defineOptions({
  name: 'ModalAssignCompanies',
})

type DisplayCompany = {
  id: string
  label: string
  documentNumber?: string | null
  email?: string | null
  isOwner: boolean
}

const props = defineProps<{
  modalOpen: boolean
  user: UserList | null
}>()

const emit = defineEmits<{
  'close-modal': []
  updated: []
}>()

const companyStore = useCompanyStore()

const assignedCompanyIds = ref<string[]>([])
const assignedCompaniesById = ref<Record<string, DisplayCompany>>({})
const companyCandidates = ref<CompanyList[]>([])
const companySearch = ref('')
const showSuggestions = ref(false)
const isSearchingCompanies = ref(false)
const pendingCompanyId = ref<string | null>(null)
const hasChanges = ref(false)

const assignCompanyModalOpen = ref(false)
const pendingAssignCompany = ref<CompanyList | null>(null)

/** Toda asignación en este modal se envía siempre como dueño. */
const ASSIGN_AS_OWNER = true as const

const isBusy = computed(() => pendingCompanyId.value !== null)

const modalTitle = computed(() => {
  if (!props.user) return 'Asociar empresas'

  const name = [props.user.firstName, props.user.lastName].filter(Boolean).join(' ').trim()
  return name ? `Asociar empresas - ${name}` : 'Asociar empresas'
})

const assignActionLabel = 'Agregar empresa'

const assignedCompanies = computed(() =>
  assignedCompanyIds.value
    .map((id) => assignedCompaniesById.value[id] ?? null)
    .filter((company): company is DisplayCompany => Boolean(company)),
)

const formatCompanyLabel = (
  company: Pick<CompanyList, 'businessName' | 'tradeName' | 'documentNumber' | 'id'> | DisplayCompany,
) => {
  if ('label' in company && company.label) return company.label

  const businessName = 'businessName' in company ? company.businessName?.trim() : ''
  if (businessName) return businessName

  const tradeName = 'tradeName' in company ? company.tradeName?.trim() : ''
  if (tradeName) return tradeName

  const documentNumber = company.documentNumber?.trim()
  if (documentNumber) return documentNumber

  return company.id
}

const getCompanyInitials = (company: { label?: string, businessName?: string | null, tradeName?: string | null, id: string }) => {
  const label = formatCompanyLabel(company as CompanyList)
  const parts = label.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  return (label[0] ?? '?').toUpperCase()
}

const companyToDisplay = (company: CompanyList | UserCompany, isOwner = false): DisplayCompany => ({
  id: company.id,
  label: 'businessName' in company
    ? formatCompanyLabel(company)
    : formatUserCompanyName(company),
  documentNumber: company.documentNumber,
  email: company.email,
  isOwner: 'isOwner' in company ? Boolean(company.isOwner) : isOwner,
})

const fetchCompanyCandidates = async (search = '') => {
  isSearchingCompanies.value = true

  try {
    await companyStore.getCompanies({
      page: 1,
      amount: 100,
      search: search.trim() || undefined,
    }, true)

    companyCandidates.value = [...companyStore.companies]
  } catch {
    companyCandidates.value = []
  } finally {
    isSearchingCompanies.value = false
  }
}

const availableCompanies = computed(() =>
  companyCandidates.value.filter((company) => !assignedCompanyIds.value.includes(company.id)),
)

const filteredCompanies = computed(() => availableCompanies.value.slice(0, 20))

const showSuggestionsPanel = computed(() => showSuggestions.value)

const {
  anchorRef: companyAnchorRef,
  panelStyle: companyPanelStyle,
} = useAnchoredOverlay(showSuggestionsPanel)

const runCompanySearch = useDebounceFn(async (term: string) => {
  await fetchCompanyCandidates(term)
}, 300)

const onCompanySearchInput = () => {
  showSuggestions.value = true
  void runCompanySearch(companySearch.value)
}

const onCompanySearchFocus = () => {
  showSuggestions.value = true
  void runCompanySearch(companySearch.value)
}

const onCompanySearchBlur = () => {
  window.setTimeout(() => {
    showSuggestions.value = false
  }, 150)
}

const assignCompany = async (company: CompanyList) => {
  if (!props.user || assignedCompanyIds.value.includes(company.id) || isBusy.value) return

  const displayCompany = companyToDisplay(company, ASSIGN_AS_OWNER)
  const previousIds = [...assignedCompanyIds.value]
  const previousCompanies = { ...assignedCompaniesById.value }

  assignedCompanyIds.value = [...assignedCompanyIds.value, company.id]
  assignedCompaniesById.value = {
    ...assignedCompaniesById.value,
    [company.id]: displayCompany,
  }
  pendingCompanyId.value = company.id

  try {
    await companyStore.assignUsersToCompany(company.id, [props.user.id], ASSIGN_AS_OWNER)
    hasChanges.value = true
  } catch {
    assignedCompanyIds.value = previousIds
    assignedCompaniesById.value = previousCompanies
  } finally {
    pendingCompanyId.value = null
  }
}

const requestAssignCompany = (company: CompanyList) => {
  if (!props.user || assignedCompanyIds.value.includes(company.id) || isBusy.value) return

  companySearch.value = ''
  showSuggestions.value = false
  pendingAssignCompany.value = company
  assignCompanyModalOpen.value = true
}

const cancelAssignCompany = () => {
  if (isBusy.value) return

  assignCompanyModalOpen.value = false
  pendingAssignCompany.value = null
}

const confirmAssignCompany = async () => {
  if (isBusy.value || !pendingAssignCompany.value) return

  const company = pendingAssignCompany.value
  assignCompanyModalOpen.value = false
  pendingAssignCompany.value = null

  await assignCompany(company)
}

const selectCompanyCandidate = (company: CompanyList) => {
  requestAssignCompany(company)
}

const confirmAddCompany = () => {
  const term = companySearch.value.trim().toLowerCase()
  const exactMatch = filteredCompanies.value.find((company) => {
    const label = formatCompanyLabel(company).toLowerCase()
    const documentNumber = company.documentNumber?.trim().toLowerCase() ?? ''
    return label === term || documentNumber === term
  })

  if (exactMatch) {
    requestAssignCompany(exactMatch)
    return
  }

  showSuggestions.value = true
  void runCompanySearch(companySearch.value)
}

const syncAssignedCompanies = (companies: UserCompany[] | undefined) => {
  const list = companies ?? []
  assignedCompaniesById.value = Object.fromEntries(
    list.map((company) => [company.id, companyToDisplay(company)]),
  )
  assignedCompanyIds.value = list.map((company) => company.id)
  companySearch.value = ''
  showSuggestions.value = false
  companyCandidates.value = []
}

watch(
  () => [props.modalOpen, props.user?.id] as const,
  ([isOpen]) => {
    if (!isOpen || !props.user) return

    hasChanges.value = false
    syncAssignedCompanies(props.user.companies)
  },
  { immediate: true },
)

const handleClose = () => {
  if (isBusy.value) return

  if (hasChanges.value) {
    emit('updated')
    hasChanges.value = false
  }

  emit('close-modal')
}
</script>
