<template>
  <ModalAction
    id="delete-users-demo-modal"
    :modal-open="modalOpen"
    @close-modal="handleClose"
  >
    <div class="text-center">
      <div
        class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/15 dark:bg-yellow-500/20"
      >
        <svg
          class="h-6 w-6 fill-current text-yellow-500"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z" />
        </svg>
      </div>

      <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
        Advertencia
      </h3>

      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <template v-if="companyName">
          <template v-if="userName">
            El usuario
            <span class="font-medium text-gray-700 dark:text-gray-200">{{ userName }}</span>
            está relacionado a la empresa
          </template>
          <template v-else>
            Este usuario está relacionado a la empresa
          </template>
          <span class="font-medium text-gray-700 dark:text-gray-200">{{ companyName }}</span>.
          ¿Deseas continuar con la eliminación?
        </template>
        <template v-else-if="userName">
          Vas a eliminar al usuario
          <span class="font-medium text-gray-700 dark:text-gray-200">{{ userName }}</span>
          (sin empresa asociada). ¿Deseas continuar?
        </template>
        <template v-else>
          Esta acción no se puede deshacer. ¿Deseas continuar?
        </template>
      </p>

      <div class="flex justify-center gap-2">
        <Button variant="secondary" @click="handleClose">
          Cancelar
        </Button>
        <Button variant="primary" @click="handleConfirm">
          Continuar
        </Button>
      </div>
    </div>
  </ModalAction>
</template>

<script setup lang="ts">
import { Button } from '~/core/ui/buttons'
import { ModalAction } from '~/core/ui/modal'

defineProps<{
  modalOpen: boolean
  userId: string | null
  userName?: string
  companyName?: string
}>()

const emit = defineEmits<{
  'close-modal': []
  confirm: []
}>()

const handleClose = () => {
  emit('close-modal')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>
