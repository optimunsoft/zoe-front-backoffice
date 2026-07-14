<template>
  <ModalAction
    id="delete-users-demo-modal"
    :modal-open="modalOpen"
    @close-modal="handleClose"
  >
    <div class="text-center">
      <div
        class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20"
      >
        <svg
          class="h-6 w-6 fill-current text-red-500"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 10.1l-1.4 1.4L8 9.4l-2.1 2.1-1.4-1.4L6.6 8 4.5 5.9l1.4-1.4L8 6.6l2.1-2.1 1.4 1.4L9.4 8l2.1 2.1z" />
        </svg>
      </div>

      <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
        ¿Eliminar usuario demo?
      </h3>

      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <template v-if="userName">
          Se eliminará el usuario
          <span class="font-medium text-gray-700 dark:text-gray-200">{{ userName }}</span>.
        </template>
        <template v-else>
          Esta acción no se puede deshacer.
        </template>
      </p>

      <div class="flex justify-center gap-2">
        <Button variant="secondary" :disabled="isDeleting" @click="handleClose">
          Cancelar
        </Button>
        <Button variant="danger" :loading="isDeleting" @click="handleConfirm">
          Eliminar
        </Button>
      </div>
    </div>
  </ModalAction>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '~/core/ui/buttons'
import { ModalAction } from '~/core/ui/modal'
import { useUsersDemoStore } from '../../store/users-demo.store'

const props = defineProps<{
  modalOpen: boolean
  userId: string | null
  userName?: string
}>()

const emit = defineEmits<{
  'close-modal': []
  deleted: []
}>()

const usersDemoStore = useUsersDemoStore()
const isDeleting = ref(false)

const handleClose = () => {
  if (isDeleting.value) return
  emit('close-modal')
}

const handleConfirm = async () => {
  if (isDeleting.value || !props.userId) return

  isDeleting.value = true

  try {
    await usersDemoStore.deleteUsersDemo(props.userId)
    emit('deleted')
  } catch {
    // El cliente API ya muestra el alert con el message de la API.
  } finally {
    isDeleting.value = false
    emit('close-modal')
  }
}
</script>
