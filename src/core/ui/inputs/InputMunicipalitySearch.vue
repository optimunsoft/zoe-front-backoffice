<template>
  <InputField
    :label="label"
    :html-for="inputId"
    :required="required"
    :hint="hint"
    :error="error"
  >
    <div ref="anchorRef" class="relative">
      <input
        :id="inputId"
        v-model="search"
        type="text"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        class="form-input w-full"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="showSuggestions"
        :aria-controls="listboxId"
        :aria-activedescendant="activeDescendantId"
        @input="onSearchInput(($event.target as HTMLInputElement).value)"
        @keydown="onKeydown"
      >
    </div>

    <Teleport to="body">
      <div
        v-if="showSuggestions && panelStyle"
        :id="listboxId"
        ref="panelRef"
        role="listbox"
        class="fixed max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700/60 dark:bg-gray-800"
        :style="panelStyle"
      >
        <button
          v-for="(municipality, index) in results"
          :id="`${listboxId}-option-${index}`"
          :key="municipality.id"
          type="button"
          role="option"
          tabindex="-1"
          :aria-selected="highlightedIndex === index"
          class="flex w-full items-center border-b border-gray-100 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-800/60"
          :class="highlightedIndex === index ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300' : ''"
          @mousedown.prevent="selectMunicipality(municipality)"
          @mouseenter="highlightedIndex = index"
        >
          <p class="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
            {{ municipality.label }}
          </p>
        </button>

        <p
          v-if="results.length === 0 && !isSearching"
          class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
        >
          No se encontraron municipios con ese criterio.
        </p>

        <p
          v-else-if="isSearching"
          class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400"
        >
          Buscando...
        </p>
      </div>
    </Teleport>
  </InputField>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

import { useAuthStore } from '~/core/auth/store/auth.store'
import { useAnchoredOverlay } from '~/core/company/composables/use-anchored-overlay'
import { useMunicipalityService } from '~/core/ubication/services/municipality.service'
import { useUbicationStore } from '~/core/ubication/store/ubication.store'
import type { Municipality } from '~/core/ubication/types/municipality.interface'
import { formatMunicipalityLabel } from '~/core/ubication/utils/municipality.utils'
import InputField from './InputField.vue'

defineOptions({
  name: 'InputMunicipalitySearch',
})

const props = withDefaults(defineProps<{
  modelValue?: string
  id?: string
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  hint?: string
  error?: string
  countryId?: string
}>(), {
  modelValue: '',
  placeholder: 'Buscar municipio...',
  label: 'Municipio',
  name: 'municipalitySearch',
  required: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const authStore = useAuthStore()
const ubicationStore = useUbicationStore()
const municipalityService = useMunicipalityService()

const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const listboxId = computed(() => `${inputId.value}-listbox`)

const search = ref('')
const searchDebounced = refDebounced(search, 300)
const results = ref<Array<{ id: string, label: string }>>([])
const isSearching = ref(false)
const isSyncingSearch = ref(false)
const suppressSuggestions = ref(false)
const highlightedIndex = ref(-1)
const panelRef = ref<HTMLElement | null>(null)

const resolvedCountryId = computed(() =>
  props.countryId?.trim() || authStore.user?.countryId,
)

const showSuggestions = computed(() =>
  !props.modelValue
  && search.value.trim().length > 0
  && !suppressSuggestions.value,
)

const activeDescendantId = computed(() => {
  if (highlightedIndex.value < 0) return undefined

  return `${listboxId.value}-option-${highlightedIndex.value}`
})

const { anchorRef, panelStyle } = useAnchoredOverlay(showSuggestions)

const resetHighlight = () => {
  highlightedIndex.value = -1
}

const scrollHighlightedIntoView = async () => {
  await nextTick()

  if (highlightedIndex.value < 0 || !panelRef.value) return

  const option = panelRef.value.querySelector<HTMLElement>(
    `#${listboxId.value}-option-${highlightedIndex.value}`,
  )

  option?.scrollIntoView({ block: 'nearest' })
}

const onKeydown = async (event: KeyboardEvent) => {
  if (props.disabled) return

  if (event.key === 'Escape') {
    if (!showSuggestions.value) return

    event.preventDefault()
    suppressSuggestions.value = true
    resetHighlight()
    return
  }

  if (!results.value.length || isSearching.value) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    highlightedIndex.value = highlightedIndex.value < 0
      ? 0
      : Math.min(highlightedIndex.value + 1, results.value.length - 1)
    await scrollHighlightedIntoView()
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    highlightedIndex.value = highlightedIndex.value <= 0
      ? 0
      : highlightedIndex.value - 1
    await scrollHighlightedIntoView()
    return
  }

  if (event.key === 'Enter' && highlightedIndex.value >= 0) {
    event.preventDefault()
    const municipality = results.value[highlightedIndex.value]
    if (municipality) {
      await selectMunicipality(municipality)
    }
  }
}

const onSearchInput = (value: string) => {
  if (isSyncingSearch.value) return

  suppressSuggestions.value = false
  resetHighlight()
  emit('update:modelValue', '')

  if (!value.trim()) {
    results.value = []
  }
}

const selectMunicipality = async (municipality: { id: string, label: string }) => {
  isSyncingSearch.value = true
  suppressSuggestions.value = false
  resetHighlight()
  emit('update:modelValue', municipality.id)
  search.value = municipality.label
  results.value = []
  await nextTick()
  isSyncingSearch.value = false
}

const fetchMunicipalities = async (name: string) => {
  isSearching.value = true

  try {
    const { response } = await municipalityService.search({
      name,
      countryId: resolvedCountryId.value,
    })

    results.value = (response ?? []).map((item) => ({
      id: item.id,
      label: formatMunicipalityLabel(item),
    }))
  } catch {
    results.value = []
  } finally {
    isSearching.value = false
  }
}

const loadLabelById = async (municipalityId: string) => {
  const municipality = await ubicationStore.getMunicipalityById(municipalityId)
  if (!municipality) return

  isSyncingSearch.value = true
  search.value = formatMunicipalityLabel(municipality)
  results.value = []
  await nextTick()
  isSyncingSearch.value = false
}

const setMunicipality = async (
  municipality: Pick<Municipality, 'id' | 'name' | 'state'> | null,
) => {
  if (!municipality?.id) {
    reset()
    return
  }

  isSyncingSearch.value = true
  emit('update:modelValue', municipality.id)
  search.value = municipality.state?.name
    ? formatMunicipalityLabel(municipality)
    : municipality.name
  results.value = []
  await nextTick()
  isSyncingSearch.value = false
}

const reset = () => {
  search.value = ''
  results.value = []
  suppressSuggestions.value = false
  resetHighlight()
  emit('update:modelValue', '')
}

watch(results, () => {
  resetHighlight()
})

watch(searchDebounced, async (term) => {
  if (props.modelValue) return

  const normalized = term.trim()
  if (!normalized) {
    results.value = []
    return
  }

  await fetchMunicipalities(normalized)
})

watch(
  () => props.modelValue,
  async (municipalityId, previousId) => {
    if (!municipalityId) {
      if (!isSyncingSearch.value) {
        search.value = ''
        results.value = []
      }
      return
    }

    if (isSyncingSearch.value) return
    if (municipalityId === previousId && search.value.trim()) return

    await loadLabelById(municipalityId)
  },
)

defineExpose({
  reset,
  setMunicipality,
})
</script>
