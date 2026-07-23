<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Selecciona los módulos que se asignarán a la empresa. Este paso es opcional.
    </p>

    <div ref="moduleFieldRef" class="relative">
      <div ref="moduleAnchorRef" class="flex items-center gap-2">
        <input
          id="wizard-module-search"
          ref="moduleInputRef"
          v-model="moduleSearch"
          type="text"
          name="moduleSearch"
          placeholder="Buscar módulo..."
          class="form-input w-full"
          autocomplete="off"
          @focus="onSearchFocus"
          @click="onSearchFocus"
        >
        <Button
          type="button"
          variant="primary"
          class="shrink-0"
          :disabled="!pendingModule || isSearchingModules"
          @mousedown.prevent
          @click="confirmAddModule"
        >
          <template #icon>
            <UiIcon name="plus" size="sm" />
          </template>
          Agregar
        </Button>
      </div>

      <Teleport to="body">
        <div
          v-if="showModuleSuggestions && modulePanelStyle"
          ref="modulePanelRef"
          class="fixed max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700/60 dark:bg-gray-800"
          :style="modulePanelStyle"
        >
          <button
            v-for="option in filteredOptions"
            :key="option.value"
            type="button"
            class="flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-800/60"
            :class="pendingModule?.value === option.value ? 'bg-brand-50 dark:bg-brand-500/10' : ''"
            @mousedown.prevent="selectModuleCandidate(option)"
          >
            <span class="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
              <UiIcon name="dashboard" size="sm" />
            </span>
            <span class="min-w-0 flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-100">
              {{ option.label }}
            </span>
            <span
              v-if="option.code"
              class="shrink-0 text-xs text-gray-500 dark:text-gray-400"
            >
              {{ option.code }}
            </span>
          </button>

          <p
            v-if="isSearchingModules"
            class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
          >
            Buscando módulos...
          </p>
          <p
            v-else-if="hasSearched && filteredOptions.length === 0"
            class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
          >
            No se encontraron módulos con ese criterio.
          </p>
        </div>
      </Teleport>
    </div>

    <div v-if="selectedModules.length > 0" class="space-y-2">
      <div
        v-for="module in selectedModules"
        :key="module.value"
        class="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-700/60 dark:bg-gray-900/40"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
            {{ module.label }}
          </p>
          <p class="truncate text-xs text-gray-500 dark:text-gray-400">
            {{ module.code || '—' }}
          </p>
        </div>
        <Button
          type="button"
          variant="danger-outline"
          size="sm"
          @click="removeModule(module.value)"
        >
          Quitar
        </Button>
      </div>
    </div>

    <p
      v-else
      class="text-sm text-gray-500 dark:text-gray-400"
    >
      No hay módulos seleccionados.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { onClickOutside, refDebounced } from '@vueuse/core'

import { useAnchoredOverlay } from '~/core/company/composables/use-anchored-overlay'
import { Button } from '~/core/ui/buttons'
import { UiIcon } from '~/core/ui/icons'
import { useModulesStore } from '~/modules/modules/store/modules.store'

type ModuleOption = {
  label: string
  value: string
  code: string
}

const model = defineModel<string[]>({ default: () => [] })

const modulesStore = useModulesStore()

const moduleFieldRef = ref<HTMLElement | null>(null)
const modulePanelRef = ref<HTMLElement | null>(null)
const moduleInputRef = ref<HTMLInputElement | null>(null)
const moduleSearch = ref('')
const moduleSearchDebounced = refDebounced(moduleSearch, 300)
const isSearchingModules = ref(false)
const showModuleSuggestions = ref(false)
const hasSearched = ref(false)
const pendingModule = ref<ModuleOption | null>(null)
const selectedModules = ref<ModuleOption[]>([])

const selectedIds = computed(() => selectedModules.value.map((item) => item.value))

const filteredOptions = computed(() =>
  modulesStore.modules
    .filter((module) => !selectedIds.value.includes(module.id))
    .map((module) => ({
      label: module.name,
      value: module.id,
      code: module.code,
    })),
)

const {
  anchorRef: moduleAnchorRef,
  panelStyle: modulePanelStyle,
  updatePosition: updateModulePanelPosition,
} = useAnchoredOverlay(showModuleSuggestions, {
  preferBelow: true,
  zIndex: 120,
})

const syncModel = () => {
  model.value = selectedModules.value.map((item) => item.value)
}

const searchModules = async (term: string) => {
  isSearchingModules.value = true
  hasSearched.value = true
  try {
    await modulesStore.getModules(term.trim() ? { search: term.trim() } : {}, true)
  } finally {
    isSearchingModules.value = false
    await nextTick()
    updateModulePanelPosition()
  }
}

watch(moduleSearchDebounced, async (term) => {
  if (!showModuleSuggestions.value) return
  if (pendingModule.value && term.trim() === pendingModule.value.label) return
  pendingModule.value = null
  await searchModules(term)
})

watch(
  model,
  (ids) => {
    const nextIds = ids ?? []
    if (
      nextIds.length === selectedIds.value.length
      && nextIds.every((id, index) => id === selectedIds.value[index])
    ) {
      return
    }

    selectedModules.value = nextIds.map((id) => {
      const existing = selectedModules.value.find((item) => item.value === id)
      if (existing) return existing
      const fromStore = modulesStore.modules.find((item) => item.id === id)
      return {
        value: id,
        label: fromStore?.name ?? id,
        code: fromStore?.code ?? '',
      }
    })
  },
  { immediate: true },
)

const selectModuleCandidate = (option: ModuleOption) => {
  pendingModule.value = option
  moduleSearch.value = option.label
  showModuleSuggestions.value = false
}

const confirmAddModule = () => {
  if (!pendingModule.value) return
  if (selectedIds.value.includes(pendingModule.value.value)) return

  selectedModules.value = [...selectedModules.value, pendingModule.value]
  pendingModule.value = null
  moduleSearch.value = ''
  showModuleSuggestions.value = false
  syncModel()
  moduleInputRef.value?.focus()
}

const removeModule = (moduleId: string) => {
  selectedModules.value = selectedModules.value.filter((item) => item.value !== moduleId)
  syncModel()
}

const onSearchFocus = async () => {
  showModuleSuggestions.value = true
  await nextTick()
  updateModulePanelPosition()
  await searchModules(moduleSearch.value)
}

onClickOutside(
  moduleFieldRef,
  () => {
    showModuleSuggestions.value = false
  },
  { ignore: [modulePanelRef] },
)

onMounted(async () => {
  await searchModules('')
})
</script>
