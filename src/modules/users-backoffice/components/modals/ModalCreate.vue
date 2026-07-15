<template>
  <ModalBasic
    id="create-users-backoffice-modal"
    :modal-open="modalOpen"
    title="Crear usuario backoffice"
    description="Completa los datos para registrar un usuario del Back Office."
    size="4xl"
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
        <UiIcon name="userAdd" size="md" class="text-violet-500" />
      </div>
    </template>

    <FormUsersBackoffice
      v-if="modalOpen"
      ref="formRef"
      mode="create"
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
import { UiIcon } from '~/core/ui/icons'
import { ModalBasic } from '~/core/ui/modal'
import { useUsersStore } from '~/modules/administration/users/store/users.store'
import type { UserCreate, UserUpdate } from '~/modules/administration/users/types/users.types'
import FormUsersBackoffice from '../forms/Form.vue'

type UserFormExpose = {
  submit: () => void
  reset: () => void
}

defineProps<{
  modalOpen: boolean
}>()

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
    await usersStore.createUser(payload as UserCreate)
    formRef.value?.reset()
    emit('created')
    emit('close-modal')
  } finally {
    isSubmitting.value = false
  }
}
</script>
