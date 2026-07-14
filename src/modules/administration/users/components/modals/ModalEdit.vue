<template>
  <ModalBasic
    id="edit-user-modal"
    :modal-open="modalOpen"
    :title="modalTitle"
    description="Actualiza los datos del usuario. El tipo no se puede modificar."
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
      <FormUser
        :key="user.id"
        ref="formRef"
        mode="edit"
        :initial-user="user"
        @submit="handleEdit"
        @refresh="emit('updated')"
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
import { useUsersStore } from '../../store/users.store'
import type { User, UserCreate, UserUpdate } from '../../types/users.types'
import FormUser from '../forms/Form.vue'

type UserFormExpose = {
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
}>()

const usersStore = useUsersStore()
const formRef = ref<UserFormExpose | null>(null)
const isSubmitting = ref(false)

const modalTitle = computed(() => {
  if (!props.user) return 'Editar usuario'

  const name = [props.user.firstName, props.user.lastName].filter(Boolean).join(' ').trim()
  if (!name) return 'Editar usuario'

  return `Editar usuario - ${name}`
})

const handleClose = () => {
  if (isSubmitting.value) return
  formRef.value?.reset()
  emit('close-modal')
}

const submitForm = () => {
  formRef.value?.submit()
}

const handleEdit = async (payload: UserCreate | UserUpdate) => {
  const userId = props.user?.id
  if (isSubmitting.value || !userId) return

  isSubmitting.value = true

  try {
    await usersStore.updateUser(userId, payload as UserUpdate)
    formRef.value?.reset()
    emit('updated')
    emit('close-modal')
  } finally {
    isSubmitting.value = false
  }
}
</script>
