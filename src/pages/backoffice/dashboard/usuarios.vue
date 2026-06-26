<template>
  <div class="w-full max-w-[96rem] mx-auto">
    <div class="sm:flex sm:justify-between sm:items-center mb-8">
      <div class="mb-4 sm:mb-0">
        <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Usuarios
        </h1>
      </div>

      <div class="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
        <Button
          variant="danger-outline"
          :disabled="selectedItems.length === 0"
          @click="handleDeleteSelected"
        >
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
            </svg>
          </template>
          Eliminar
        </Button>

        <DateSelect />
        <FilterButton align="right" />

        <Button
          variant="primary"
          aria-controls="new-user-modal"
          @click="handleCreateUser"
        >
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
          </template>
          Nuevo usuario
        </Button>
      </div>
    </div>

    <UTable
      title="Todos los usuarios"
      :count="rows.length"
      :columns="columns"
      :rows="rows"
      selectable
      show-favorite
      show-actions
      actions-mode="inline"
      actions-label="Acciones"
      :action-buttons="actionButtons"
      @change-selection="updateSelectedItems"
      @action="handleRowAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '~/core/ui/buttons'
import FilterButton from '~/core/ui/dropdown/DropdownFilter.vue'
import DateSelect from '~/core/ui/form/DateSelect.vue'
import UTable from '~/core/ui/Tables/Utable.vue'
import type { UTableActionButton, UTableColumn, UTableRow } from '~/core/ui/Tables/utable.types'

const selectedItems = ref<Array<string | number>>([])

const columns: UTableColumn[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Rol' },
  { key: 'company', label: 'Empresa' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'status', label: 'Estado', align: 'center', variantKey: 'statusVariant' },
]

const rows = ref<UTableRow[]>([
  {
    id: 1,
    name: 'Lewis Manzano',
    email: 'lewis.manzano@optimumsoft.co',
    role: 'Administrador',
    company: 'Optimum Soft',
    phone: '+57 300 000 0000',
    status: 'Activo',
    statusVariant: 'success',
    fav: true,
  },
])

const actionButtons: UTableActionButton[] = [
  { key: 'edit', label: 'Editar' },
  { key: 'delete', label: 'Eliminar', tone: 'danger' },
]

const handleCreateUser = () => {
  // TODO: abrir modal o navegar al formulario de creación
  console.log('create user')
}

const handleDeleteSelected = () => {
  // TODO: conectar con API
  console.log('delete', selectedItems.value)
}

const updateSelectedItems = (selected: Array<string | number>) => {
  selectedItems.value = selected
}

const handleRowAction = ({ action, row }: { action: string, row: UTableRow }) => {
  // TODO: conectar con API / navegación
  console.log(action, row.id)
}
</script>
