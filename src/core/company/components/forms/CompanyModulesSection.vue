<template>
  <div class="company-config-panel">
    <div class="company-config-panel__header">
      <h4 class="text-sm font-semibold text-gray-400 dark:text-gray-100">
        Módulos asignados
      </h4>
    </div>

    <div class="company-config-panel__body">
      <div
        v-if="alignToolbar"
        class="company-config-panel__toolbar"
        aria-hidden="true"
      />

      <div ref="moduleAnchorRef" class="company-config-panel__search">
        <input
          id="company-module-search"
          v-model="moduleSearch"
          type="text"
          name="moduleSearch"
          placeholder="Agregar módulo"
          class="company-config-panel__search-input form-input w-full pr-10"
          @input="onModuleSearchInput"
          @focus="onModuleSearchFocus"
          @blur="onModuleSearchBlur"
        >
        <button
          type="button"
          class="company-config-panel__search-action"
          aria-label="Agregar módulo"
          :disabled="isSearchingModules"
          @mousedown.prevent
          @click="confirmAddModule"
        >
          <UiIcon name="plus" size="sm" />
        </button>
      </div>

      <Teleport to="body">
        <div
          v-if="showModuleSuggestionsPanel && modulePanelStyle"
          class="fixed max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700/60 dark:bg-gray-800"
          :style="modulePanelStyle"
        >
          <button
            v-for="option in filteredModuleOptions"
            :key="String(option.value)"
            type="button"
            class="flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-800/60"
            @mousedown.prevent="addModule(String(option.value))"
          >
            <span
              class="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-500 dark:bg-violet-500/20"
            >
              <UiIcon :name="getModuleIcon(String(option.value))" size="sm" />
            </span>
            <span class="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
              {{ option.label }}
            </span>
            <span
              v-if="option.code"
              class="ml-auto shrink-0 text-xs text-gray-500 dark:text-gray-400"
            >
              {{ option.code }}
            </span>
          </button>

          <p
            v-if="filteredModuleOptions.length === 0 && !isSearchingModules"
            class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
          >
            No se encontraron módulos con ese criterio.
          </p>

          <p
            v-else-if="isSearchingModules"
            class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
          >
            Buscando módulos...
          </p>
        </div>
      </Teleport>

      <div
        v-if="selectedModules.length > 0"
        class="company-config-panel__list"
      >
        <div
          v-for="module in selectedModules"
          :key="module.value"
          class="company-config-panel__card"
          :class="isModuleActive(module.value)
            ? 'bg-sky-50 dark:bg-sky-500/10'
            : 'bg-red-50 dark:bg-red-500/10'"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span
              class="inline-flex size-9 shrink-0 items-center justify-center rounded-full shadow-sm"
              :class="isModuleActive(module.value)
                ? 'bg-white text-sky-600 dark:bg-sky-500/20 dark:text-sky-300'
                : 'bg-white text-red-500 dark:bg-red-500/20 dark:text-red-400'"
            >
              <UiIcon :name="getModuleIcon(module.value)" size="sm" />
            </span>
            <div class="company-config-panel__card-text">
              <p
                class="truncate text-sm font-medium"
                :class="isModuleActive(module.value)
                  ? 'text-gray-800 dark:text-gray-100'
                  : 'text-red-700 dark:text-red-300'"
              >
                {{ module.label }}
              </p>
              <p
                class="company-config-panel__card-subtitle truncate text-xs"
                :class="isModuleActive(module.value)
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-red-600 dark:text-red-400'"
              >
                {{ module.code || '\u00A0' }}
              </p>
            </div>
          </div>
          <InputSwitch
            :id="`company-module-active-${module.value}`"
            :model-value="isModuleActive(module.value)"
            :label="`Estado del módulo ${module.label}`"
            :show-state-label="false"
            on-label="Activo"
            off-label="Inactivo"
            wrapper-class="shrink-0"
            :disabled="isUpdatingModuleStatus"
            @update:model-value="onModuleActiveToggle(module.value, $event)"
          />
        </div>
      </div>

      <p
        v-else
        class="company-config-panel__empty"
      >
        No hay módulos asignados.
      </p>
    </div>
  </div>

  <ModalAction
    id="confirm-module-status-modal"
    :modal-open="moduleStatusModalOpen"
    @close-modal="cancelModuleStatusChange"
  >
    <div class="text-center">
      <div
        class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full"
        :class="pendingModuleActive
          ? 'bg-violet-100 dark:bg-violet-500/20'
          : 'bg-amber-100 dark:bg-amber-500/20'"
      >
        <svg
          class="size-6 fill-current"
          :class="pendingModuleActive ? 'text-violet-500' : 'text-amber-500'"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path
            v-if="pendingModuleActive"
            d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.7 5.3l-4.2 4.2c-.2.2-.5.2-.7 0L4.3 7.8c-.2-.2-.2-.5 0-.7l.7-.7c.2-.2.5-.2.7 0l1.8 1.8 3.5-3.5c.2-.2.5-.2.7 0l.7.7c.2.2.2.5 0 .7z"
          />
          <path
            v-else
            d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 11H7V7h2v4zm0-6H7V3h2v2z"
          />
        </svg>
      </div>

      <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
        {{ pendingModuleActive ? '¿Activar módulo?' : '¿Desactivar módulo?' }}
      </h3>

      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <template v-if="pendingModuleName">
          {{
            pendingModuleActive
              ? `El módulo ${pendingModuleName} quedará activo para esta empresa.`
              : `El módulo ${pendingModuleName} quedará inactivo para esta empresa.`
          }}
        </template>
        <template v-else>
          {{
            pendingModuleActive
              ? 'El módulo quedará activo para esta empresa.'
              : 'El módulo quedará inactivo para esta empresa.'
          }}
        </template>
      </p>

      <div class="flex justify-center gap-2">
        <Button
          variant="secondary"
          :disabled="isUpdatingModuleStatus"
          @click="cancelModuleStatusChange"
        >
          Cancelar
        </Button>
        <Button
          :variant="pendingModuleActive ? 'primary' : 'danger'"
          :loading="isUpdatingModuleStatus"
          @click="confirmModuleStatusChange"
        >
          {{ pendingModuleActive ? 'Activar' : 'Desactivar' }}
        </Button>
      </div>
    </div>
  </ModalAction>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

import { useModulesStore } from '~/modules/modules/store/modules.store'
import { Button } from '~/core/ui/buttons'
import { ModalAction } from '~/core/ui/modal'
import InputSwitch from '~/core/ui/inputs/InputSwitch.vue'
import { UiIcon, type UiIconName } from '~/core/ui/icons'
import { ActiveModule, type CompanyModule } from '../../types/company.types'
import {
  isCompanyModuleActive,
  mapModuleListToCompanyModule,
  normalizeCompanyModules,
} from '../../mappers/company-module.mapper'
import { useAnchoredOverlay } from '../../composables/use-anchored-overlay'
import { useCompanyStore } from '../../store/company.store'
import './company-config-panel.css'

defineOptions({
  name: 'CompanyModulesSection',
})

const props = defineProps<{
  mode: 'create' | 'edit'
  companyId?: string | null
  alignToolbar?: boolean
}>()

const modulesStore = useModulesStore()
const companyStore = useCompanyStore()

const isEditMode = computed(() => props.mode === 'edit')

type ModuleOption = {
  label: string
  value: string
  code: string
}

const selectedCompanyModules = ref<CompanyModule[]>([])
const moduleSearch = ref('')
const moduleSearchDebounced = refDebounced(moduleSearch, 300)
const isSearchingModules = ref(false)
const isUpdatingModuleStatus = ref(false)
const showModuleSuggestions = ref(false)

const moduleStatusModalOpen = ref(false)
const pendingModuleId = ref<string | null>(null)
const pendingModuleActive = ref<boolean | null>(null)
const pendingModuleName = ref('')

const getModuleIcon = (_moduleId: string): UiIconName => 'dashboard'

const getCompanyModuleLabel = (module: CompanyModule) =>
  module.name || module.code || module.moduleId

const selectedModules = computed(() =>
  selectedCompanyModules.value.map((module) => ({
    value: module.moduleId,
    label: getCompanyModuleLabel(module),
    code: module.code,
  })),
)

const selectedModuleIds = computed(() =>
  selectedCompanyModules.value.map((module) => module.moduleId),
)

const availableModuleOptions = computed<ModuleOption[]>(() =>
  modulesStore.modules
    .filter((module) => !selectedModuleIds.value.includes(module.id))
    .map((module) => ({
      label: module.name,
      value: module.id,
      code: module.code,
    })),
)

const filteredModuleOptions = computed(() => availableModuleOptions.value)

const showModuleSuggestionsPanel = computed(() =>
  showModuleSuggestions.value
  && (isSearchingModules.value
    || filteredModuleOptions.value.length > 0
    || moduleSearch.value.trim().length > 0),
)

const {
  anchorRef: moduleAnchorRef,
  panelStyle: modulePanelStyle,
} = useAnchoredOverlay(showModuleSuggestionsPanel)

const syncModuleAssignments = (modules: CompanyModule[]) => {
  selectedCompanyModules.value = normalizeCompanyModules(modules)
  moduleSearch.value = ''
  showModuleSuggestions.value = false
}

const getCompanyModule = (moduleId: string) =>
  selectedCompanyModules.value.find((module) => module.moduleId === moduleId) ?? null

const isModuleActive = (moduleId: string) => {
  const module = getCompanyModule(moduleId)
  return module ? isCompanyModuleActive(module) : false
}

const onModuleSearchInput = () => {
  showModuleSuggestions.value = true
}

const onModuleSearchFocus = async () => {
  showModuleSuggestions.value = true

  if (modulesStore.modules.length === 0) {
    await searchModules(moduleSearch.value)
  }
}

const onModuleSearchBlur = () => {
  window.setTimeout(() => {
    showModuleSuggestions.value = false
  }, 150)
}

const searchModules = async (term: string) => {
  const query = term.trim()

  isSearchingModules.value = true

  try {
    await modulesStore.getModules(query ? { search: query } : {})
  } finally {
    isSearchingModules.value = false
  }
}

const addModule = async (moduleId: string) => {
  if (!moduleId || selectedModuleIds.value.includes(moduleId)) return

  const catalogModule = modulesStore.getModuleFromList(moduleId)
  const companyModule = catalogModule
    ? mapModuleListToCompanyModule(catalogModule, ActiveModule.ACTIVO)
    : {
        moduleId,
        code: '',
        name: moduleId,
        status: ActiveModule.ACTIVO,
      }

  if (props.companyId && isEditMode.value) {
    try {
      await companyStore.assignModulesToCompany(props.companyId, moduleId, ActiveModule.ACTIVO)
    } catch {
      return
    }
  }

  selectedCompanyModules.value = [...selectedCompanyModules.value, companyModule]
  moduleSearch.value = ''
  showModuleSuggestions.value = false
}

const setModuleActive = async (moduleId: string, active: boolean) => {
  const currentModule = getCompanyModule(moduleId)
  if (!moduleId || !currentModule) return

  const isCurrentlyActive = isCompanyModuleActive(currentModule)
  if (isCurrentlyActive === active) return

  const nextAction = active ? ActiveModule.ACTIVO : ActiveModule.INACTIVO

  if (props.companyId && isEditMode.value) {
    isUpdatingModuleStatus.value = true

    try {
      await companyStore.assignModulesToCompany(props.companyId, moduleId, nextAction)
    } catch {
      return
    } finally {
      isUpdatingModuleStatus.value = false
    }
  }

  selectedCompanyModules.value = selectedCompanyModules.value.map((module) =>
    module.moduleId === moduleId
      ? { ...module, status: nextAction }
      : module,
  )
}

const onModuleActiveToggle = (moduleId: string, active: boolean) => {
  if (isUpdatingModuleStatus.value) return

  const currentModule = getCompanyModule(moduleId)
  if (!currentModule || isModuleActive(moduleId) === active) return

  pendingModuleId.value = moduleId
  pendingModuleActive.value = active
  pendingModuleName.value = getCompanyModuleLabel(currentModule)
  moduleStatusModalOpen.value = true
}

const cancelModuleStatusChange = () => {
  if (isUpdatingModuleStatus.value) return

  moduleStatusModalOpen.value = false
  pendingModuleId.value = null
  pendingModuleActive.value = null
  pendingModuleName.value = ''
}

const confirmModuleStatusChange = async () => {
  if (
    isUpdatingModuleStatus.value
    || pendingModuleId.value === null
    || pendingModuleActive.value === null
  ) return

  const moduleId = pendingModuleId.value
  const active = pendingModuleActive.value

  moduleStatusModalOpen.value = false
  pendingModuleId.value = null
  pendingModuleActive.value = null
  pendingModuleName.value = ''

  await setModuleActive(moduleId, active)
}

const confirmAddModule = async () => {
  const term = moduleSearch.value.trim().toLowerCase()
  const match = filteredModuleOptions.value.find((option) =>
    option.label.toLowerCase() === term || option.code.toLowerCase() === term,
  )

  if (match) {
    await addModule(match.value)
  }
}

watch(moduleSearchDebounced, async (term) => {
  await searchModules(term)
})

const reset = () => {
  moduleStatusModalOpen.value = false
  pendingModuleId.value = null
  pendingModuleActive.value = null
  pendingModuleName.value = ''
  syncModuleAssignments([])
}

const setModules = (modules: CompanyModule[]) => {
  syncModuleAssignments(modules)
}

defineExpose({
  reset,
  setModules,
})
</script>
