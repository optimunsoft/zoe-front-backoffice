<template>
  <ModalBasic
    id="create-user-modal"
    :modal-open="modalOpen"
    title="Crear usuario"
    description="Completa los datos para registrar un nuevo usuario."
    size="4xl"
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
        <svg class="size-5 fill-current text-violet-500" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
        </svg>
      </div>
    </template>

    <FormUser
      v-if="modalOpen"
      ref="formRef"
      mode="create"
      :show-backoffice-section="showBackofficeSection"
      @submit="handleCreate"
    />

    <template #footer>
      <Button variant="secondary" :disabled="isSubmitting" @click="handleClose">
        Cancelar
      </Button>
      <Button variant="primary" :loading="isSubmitting" @click="submitForm">
        Crear usuario
      </Button>
    </template>
  </ModalBasic>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '~/core/ui/buttons'
import { ModalBasic } from '~/core/ui/modal'
import { useUsersStore } from '../../store/users.store'
import type { UserCreate, UserUpdate } from '../../types/users.types'
import FormUser from '../forms/Form.vue'

type UserFormExpose = {
  submit: () => void
  reset: () => void
}

withDefaults(defineProps<{
  modalOpen: boolean
  showBackofficeSection?: boolean
}>(), {
  showBackofficeSection: true,
})

const emit = defineEmits<{
  'close-modal': []
  created: []
}>()

const usersStore = useUsersStore()
const formRef = ref<UserFormExpose | null>(null)
const isSubmitting = ref(false)

const handleClose = () => {
  if (isSubmitting.value) return
  formRef.value?.reset()
  emit('close-modal')
}

const submitForm = () => {
  formRef.value?.submit()
}

const handleCreate = async (payload: UserCreate | UserUpdate) => {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    const { isAdmin: _isAdmin, isVerified: _isVerified, ...createPayload } = payload
    await usersStore.createUser(createPayload as UserCreate)
    formRef.value?.reset()
    emit('created')
    emit('close-modal')
  } finally {
    isSubmitting.value = false
  }
}
</script>
