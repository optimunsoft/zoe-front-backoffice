<template>
  <div class="w-full max-w-[96rem] mx-auto">

    <!-- Page header -->
    <div class="sm:flex sm:justify-between sm:items-center mb-8">
      <div class="mb-4 sm:mb-0">
        <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Agendamientos
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
          aria-controls="new-scheduling-modal"
          @click.stop="openSchedulingModal"
        >
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
          </template>
          Nuevo agendamiento
        </Button>
      </div>
    </div>

    <!-- Table -->
    <UTable
      title="Todos los agendamientos"
      :count="rows.length"
      :columns="columns"
      :rows="rows"
      selectable
      show-actions
      actions-mode="inline"
      actions-label="Acciones"
      :action-buttons="actionButtons"
      @change-selection="updateSelectedItems"
      @action="handleRowAction"
    />

    <!-- Pagination -->
    <div class="mt-8">
      <PaginationClassic />
    </div>

    <ModalBasic
      id="new-scheduling-modal"
      title="Nuevo agendamiento"
      :modal-open="newSchedulingModalOpen"
      @close-modal="closeSchedulingModal"
    >
      <div class="px-5 py-4 space-y-4">
        <InputText
          id="scheduling-patient"
          v-model="newSchedulingForm.patient"
          label="Paciente"
          placeholder="Nombre del paciente"
          required
        />
        <InputSelect
          id="scheduling-service"
          v-model="newSchedulingForm.service"
          label="Servicio"
          placeholder="Seleccionar servicio"
          :options="serviceOptions"
          required
        />
        <div class="grid grid-cols-2 gap-4">
          <Datepicker
            id="scheduling-date"
            v-model="newSchedulingForm.date"
            label="Fecha"
            mode="single"
            full-width
            required
          />
          <InputText
            id="scheduling-time"
            v-model="newSchedulingForm.time"
            label="Hora"
            type="time"
            required
          />
        </div>
        <InputSelect
          id="scheduling-doctor"
          v-model="newSchedulingForm.doctor"
          label="Profesional"
          placeholder="Seleccionar profesional"
          :options="doctorOptions"
          required
        />
      </div>
      <div class="px-5 py-4 border-t border-gray-200 dark:border-gray-700/60">
        <div class="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" @click.stop="closeSchedulingModal">
            Cancelar
          </Button>
          <Button variant="primary" @click.stop="handleCreateScheduling">
            Crear agendamiento
          </Button>
        </div>
      </div>
    </ModalBasic>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '~/core/ui/buttons'
import Datepicker from '~/core/ui/form/Datepicker.vue'
import DateSelect from '~/core/ui/form/DateSelect.vue'
import FilterButton from '~/core/ui/dropdown/DropdownFilter.vue'
import { InputSelect, InputText } from '~/core/ui/inputs'
import type { InputSelectOption } from '~/core/ui/inputs/input.types'
import { ModalBasic, useModal } from '~/core/ui/modal'
import PaginationClassic from '~/core/ui/pagination/PaginationClassic.vue'
import UTable from '~/core/ui/Tables/Utable.vue'
import type { UTableActionButton, UTableColumn, UTableRow } from '~/core/ui/Tables/utable.types'

const selectedItems = ref<Array<string | number>>([])

const createEmptySchedulingForm = () => ({
  patient: '',
  service: '',
  date: '',
  time: '',
  doctor: '',
})

const newSchedulingForm = ref(createEmptySchedulingForm())

const {
  modalOpen: newSchedulingModalOpen,
  open: openSchedulingModal,
  close: closeSchedulingModal,
} = useModal({
  onClose: () => {
    newSchedulingForm.value = createEmptySchedulingForm()
  },
})

const updateSelectedItems = (selected: Array<string | number>) => {
  selectedItems.value = selected
}

const handleDeleteSelected = () => {
  // TODO: conectar con API
  console.log('delete', selectedItems.value)
}

const handleCreateScheduling = () => {
  // TODO: conectar con API
  console.log(newSchedulingForm.value)
  closeSchedulingModal()
}

const actionButtons: UTableActionButton[] = [
  { key: 'edit', label: 'Editar' },
  { key: 'download', label: 'Descargar' },
  { key: 'delete', label: 'Eliminar', tone: 'danger' },
]

const handleRowAction = ({ action, row }: { action: string, row: UTableRow }) => {
  // TODO: conectar con API / navegación
  console.log(action, row.id)
}

const columns: UTableColumn[] = [
  {
    key: 'patient',
    label: 'Paciente',
    type: 'image-label',
    imageKey: 'image',
  },
  {
    key: 'email',
    label: 'Correo',
  },
  {
    key: 'service',
    label: 'Servicio',
  },
  {
    key: 'date',
    label: 'Fecha',
    variant: 'link',
  },
  {
    key: 'time',
    label: 'Hora',
    align: 'center',
  },
  {
    key: 'doctor',
    label: 'Profesional',
  },
  {
    key: 'status',
    label: 'Estado',
    align: 'center',
    variantKey: 'statusVariant',
  },
]

const rows = [
  {
    id: 1,
    image: '/images/user-40-01.jpg',
    patient: 'María González',
    email: 'maria.gonzalez@email.com',
    service: 'Consulta general',
    date: '24/06/2026',
    time: '09:00',
    doctor: 'Dr. Pérez',
    status: 'Confirmado',
    statusVariant: 'success',
    fav: true,
  },
  {
    id: 2,
    image: '/images/user-40-02.jpg',
    patient: 'Carlos Ruiz',
    email: 'carlos.ruiz@email.com',
    service: 'Control odontológico',
    date: '24/06/2026',
    time: '10:30',
    doctor: 'Dra. López',
    status: 'Pendiente',
    statusVariant: 'warning',
    fav: false,
  },
  {
    id: 3,
    image: '/images/user-40-03.jpg',
    patient: 'Ana Martínez',
    email: 'ana.martinez@email.com',
    service: 'Limpieza dental',
    date: '25/06/2026',
    time: '11:15',
    doctor: 'Dr. Sánchez',
    status: 'Confirmado',
    statusVariant: 'success',
    fav: true,
  },
  {
    id: 4,
    image: '/images/user-40-04.jpg',
    patient: 'Luis Fernández',
    email: 'luis.fernandez@email.com',
    service: 'Ortodoncia',
    date: '25/06/2026',
    time: '14:00',
    doctor: 'Dra. Torres',
    status: 'Cancelado',
    statusVariant: 'danger',
    fav: false,
  },
  {
    id: 5,
    image: '/images/user-40-05.jpg',
    patient: 'Sofía Herrera',
    email: 'sofia.herrera@email.com',
    service: 'Blanqueamiento',
    date: '26/06/2026',
    time: '16:45',
    doctor: 'Dr. Pérez',
    status: 'Confirmado',
    statusVariant: 'success',
    fav: false,
  },
  {
    id: 6,
    image: '/images/user-40-06.jpg',
    patient: 'Diego Morales',
    email: 'diego.morales@email.com',
    service: 'Urgencia',
    date: '26/06/2026',
    time: '08:30',
    doctor: 'Dra. López',
    status: 'En sala',
    statusVariant: 'link',
    fav: true,
  },
]

const toSelectOptions = (values: string[]): InputSelectOption[] =>
  values.map(value => ({ label: value, value }))

const serviceOptions = toSelectOptions([
  'Consulta general',
  'Control odontológico',
  'Limpieza dental',
  'Ortodoncia',
  'Blanqueamiento',
  'Urgencia',
])

const doctorOptions = toSelectOptions([
  'Dr. Pérez',
  'Dra. López',
  'Dr. Sánchez',
  'Dra. Torres',
])
</script>
