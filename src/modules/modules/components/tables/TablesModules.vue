<template>
  <div class="px-4 sm:px-6 lg:px-8 pt-12 pb-8 w-full max-w-384 mx-auto">
    <div class="mb-8 flex flex-col gap-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Módulos
        </h1>

        <Button
          class="w-full sm:w-auto"
          variant="primary"
          @click="openCreateModal"
        >
          <template #icon>
            <UiIcon name="plus" size="sm" />
          </template>
          Nuevo módulo
        </Button>
      </div>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end sm:gap-8">
        <div class="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <div class="w-full sm:w-64">
            <InputSearch
              v-model="search"
              placeholder="Buscar módulo..."
              search-label="Buscar módulo"
              @submit="handleSearch"
            />
          </div>

          <ReloadButton :loading="isLoading" @click="handleReload" />
        </div>
      </div>
    </div>

    <UTable
      title="Todos los módulos"
      :count="tableRows.length"
      :columns="moduleColumns"
      :rows="tableRows"
      :refreshing="isLoading && isInitialLoadDone"
      show-actions
      actions-mode="inline"
      actions-label="Acciones"
      :action-buttons="moduleTableActions"
      empty-text="No hay módulos registrados"
      @action="handleRowAction"
    >
      <template #cell-description="{ row }">
        <span v-if="hasModuleCellValue(row.description)" class="text-gray-800 dark:text-gray-100">
          {{ row.description }}
        </span>
        <TableBadge v-else color="neutral">
          No Aplica
        </TableBadge>
      </template>

      <template #cell-price="{ row }">
        <span v-if="hasModuleCellValue(row.price)" class="font-medium text-gray-800 dark:text-gray-100">
          {{ row.price }}
        </span>
        <TableBadge v-else color="neutral">
          No Aplica
        </TableBadge>
      </template>
    </UTable>

    <ModalCreate
      :modal-open="createModalOpen"
      @close-modal="closeCreateModal"
    />

    <ModalEdit
      :modal-open="editModalOpen"
      :module="editingModule"
      @close-modal="closeEditModal"
    />

    <ModalDelete
      :modal-open="deleteModalOpen"
      :module-id="selectedDeleteId"
      :module-name="selectedDeleteName"
      @close-modal="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { watchDebounced } from '@vueuse/core'

import { Button, ReloadButton } from '~/core/ui/buttons'
import { TableBadge } from '~/core/ui/badge'
import { UiIcon } from '~/core/ui/icons'
import InputSearch from '~/core/ui/inputs/InputSearch.vue'
import UTable from '~/core/ui/Tables/Utable.vue'
import type { UTableRow } from '~/core/ui/Tables/utable.types'
import {
  hasModuleCellValue,
  mapModulesToTableRows,
  moduleColumns,
} from '../../mappers/module-table.mapper'
import { moduleTableActions } from '../../mappers/module-table.actions'
import ModalCreate from '../modals/ModalCreate.vue'
import ModalDelete from '../modals/ModalDelete.vue'
import ModalEdit from '../modals/ModalEdit.vue'
import { useModulesStore } from '../../store/modules.store'
import type { ModuleList } from '../../types/modules.types'

const modulesStore = useModulesStore()
const { modules, search, isLoading } = storeToRefs(modulesStore)

const isInitialLoadDone = ref(false)
const createModalOpen = ref(false)
const editModalOpen = ref(false)
const deleteModalOpen = ref(false)
const editingModule = ref<ModuleList | null>(null)
const selectedDeleteId = ref<string | null>(null)
const selectedDeleteName = ref('')

const tableRows = computed(() => mapModulesToTableRows(modules.value))

const openCreateModal = () => {
  createModalOpen.value = true
}

const closeCreateModal = () => {
  createModalOpen.value = false
}

const resolveModuleFromRow = (row: UTableRow): ModuleList | null => {
  const rowId = row.id == null ? '' : String(row.id).trim()
  if (rowId) {
    const byId = modulesStore.getModuleFromList(rowId)
    if (byId) return byId
  }

  const rowCode = typeof row.code === 'string' ? row.code.trim() : ''
  if (rowCode && rowCode !== '-') {
    return modulesStore.modules.find((item) => item.code === rowCode) ?? null
  }

  return null
}

const openEditModal = async (row: UTableRow) => {
  const module = resolveModuleFromRow(row)
  if (!module) return

  editingModule.value = module
  await nextTick()
  editModalOpen.value = true
}

const closeEditModal = () => {
  editModalOpen.value = false
  editingModule.value = null
}

const openDeleteModal = ({ id, name }: { id: string, name: string }) => {
  selectedDeleteId.value = id
  selectedDeleteName.value = name
  deleteModalOpen.value = true
}

const closeDeleteModal = () => {
  deleteModalOpen.value = false
  selectedDeleteId.value = null
  selectedDeleteName.value = ''
}

const handleRowAction = async ({ action, row }: { action: string, row: UTableRow }) => {
  if (row.id == null) return

  if (action === 'edit') {
    await openEditModal(row)
    return
  }

  if (action === 'delete') {
    openDeleteModal({
      id: String(row.id),
      name: String(row.name ?? row.code ?? ''),
    })
  }
}

const handleReload = async () => {
  if (isLoading.value) return
  await modulesStore.fetchModules(true)
}

const handleSearch = async () => {
  if (isLoading.value) return
  await modulesStore.fetchModules(true)
}

watchDebounced(
  search,
  async () => {
    if (!isInitialLoadDone.value || isLoading.value) return
    await modulesStore.fetchModules(true)
  },
  { debounce: 400 },
)

onMounted(async () => {
  await modulesStore.fetchModules()
  isInitialLoadDone.value = true
})
</script>
