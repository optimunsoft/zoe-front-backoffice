<template>
  <ModalBasic
    id="edit-users-demo-modal"
    :modal-open="modalOpen"
    :title="modalTitle"
    description="Actualiza los datos del usuario."
    size="4xl"
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
        <svg class="size-5 fill-current text-violet-500" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
        </svg>
      </div>
    </template>

    <template v-if="modalOpen && user">
      <FormUsersDemo
        :key="user.id"
        ref="formRef"
        :initial-user="user"
        @submit="handleEdit"
        @refresh="emit('updated')"
        @status-updated="emit('status-updated', $event)"
      />
    </template>

    <template #footer>
      <Button variant="secondary" :disabled="isSubmitting" @click="handleClose">
        Cancelar
      </Button>
      <Button
        variant="primary"
        :loading="isSubmitting"
        :disabled="!user"
        @click="submitForm"
      >
        Guardar cambios
      </Button>
    </template>
  </ModalBasic>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { Button } from '~/core/ui/buttons'
import { ModalBasic } from '~/core/ui/modal'
import { useUsersStore } from '~/modules/administration/users/store/users.store'
import type { User, UserUpdate } from '~/modules/administration/users/types/users.types'
import FormUsersDemo from '../forms/Form.vue'

type FormExpose = {
  submit: () => void
  reset: () => void
}

const props = defineProps<{
  modalOpen: boolean
  user: User | null
}>()

const emit = defineEmits<{
  'close-modal': []
  updated: []
  'status-updated': [active: boolean]
}>()

const usersStore = useUsersStore()
const formRef = ref<FormExpose | null>(null)
const isSubmitting = ref(false)

const modalTitle = computed(() => {
  if (!props.user) return 'Editar usuario demo'

  const name = [props.user.firstName, props.user.lastName].filter(Boolean).join(' ').trim()
  if (!name) return 'Editar usuario demo'

  return `Editar usuario demo - ${name}`
})

const handleClose = () => {
  if (isSubmitting.value) return
  formRef.value?.reset()
  emit('close-modal')
}

const submitForm = () => {
  formRef.value?.submit()
}

const handleEdit = async (payload: UserUpdate) => {
  const userId = props.user?.id
  if (isSubmitting.value || !userId) return

  isSubmitting.value = true

  try {
    const { isAdmin: _isAdmin, isVerified: _isVerified, ...updatePayload } = payload
    await usersStore.updateUser(userId, updatePayload as UserUpdate)
    formRef.value?.reset()
    emit('updated')
    emit('close-modal')
  } finally {
    isSubmitting.value = false
  }
}
</script>
