<template>
  <div>
    <div class="px-4 sm:px-6 lg:px-8 pt-12 pb-8 w-full max-w-[96rem] mx-auto">
      <TableDemonstration
        @create="openCreateModal"
        @edit="openEditModal"
        @delete="openDeleteModal"
      />
    </div>

    <ModalCreate
      :modal-open="createModalOpen"
      @close-modal="closeCreateModal"
    />

    <ModalEdit
      :modal-open="editModalOpen"
      :demonstration="selectedDemonstration"
      @close-modal="closeEditModal"
    />

    <ModalDelete
      :modal-open="deleteModalOpen"
      :demonstration-id="selectedDeleteId"
      :demonstration-name="selectedDeleteName"
      @close-modal="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'

import { useNotificationAlertStore } from '~/core/ui/notifications/notification-alert.store'
import ModalCreate from '~/modules/demonstration/components/modals/ModalCreate.vue'
import ModalDelete from '~/modules/demonstration/components/modals/ModalDelete.vue'
import ModalEdit from '~/modules/demonstration/components/modals/ModalEdit.vue'
import TableDemonstration from '~/modules/demonstration/components/tables/TableDemonstration.vue'
import { normalizeDemonstrationResponse } from '~/modules/demonstration/schema/demonstrations.schema'
import { useDemonstrationsStore } from '~/modules/demonstration/store/demonstrations.store'
import type { DemonstrationResponse } from '~/modules/demonstration/types/demonstration.types'

const createModalOpen = ref(false)
const editModalOpen = ref(false)
const deleteModalOpen = ref(false)
const selectedDemonstration = ref<DemonstrationResponse | null>(null)
const selectedDeleteId = ref<string | null>(null)
const selectedDeleteName = ref('')

const demonstrationsStore = useDemonstrationsStore()
const notificationStore = useNotificationAlertStore()

const openCreateModal = () => {
  createModalOpen.value = true
}

const closeCreateModal = () => {
  createModalOpen.value = false
}

const openEditModal = async (id: string) => {
  if (!id) return

  // Preferir la lista (sync, como en módulos/usuarios) para no bloquear el click.
  const fromList = demonstrationsStore.demonstrations.find(
    (item) => String(item.id) === String(id),
  )

  if (fromList) {
    selectedDemonstration.value = fromList
    await nextTick()
    editModalOpen.value = true
    return
  }

  try {
    const response = await demonstrationsStore.getDemonstrationById(id)
    const demonstration = normalizeDemonstrationResponse(response)
    if (!demonstration) {
      notificationStore.showError('No se pudo cargar el agendamiento para editar.')
      return
    }

    selectedDemonstration.value = demonstration
    await nextTick()
    editModalOpen.value = true
  } catch {
    notificationStore.showError('No se pudo cargar el agendamiento para editar.')
  }
}

const closeEditModal = () => {
  editModalOpen.value = false
  selectedDemonstration.value = null
}

const openDeleteModal = async ({ id, name }: { id: string, name: string }) => {
  selectedDeleteId.value = id
  selectedDeleteName.value = name
  await nextTick()
  deleteModalOpen.value = true
}

const closeDeleteModal = () => {
  deleteModalOpen.value = false
  selectedDeleteId.value = null
  selectedDeleteName.value = ''
}
</script>
