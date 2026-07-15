<template>
  <ModalBasic
    id="edit-users-backoffice-modal"
    :modal-open="modalOpen"
    :title="modalTitle"
    description="Actualiza los datos del usuario backoffice."
    size="4xl"
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
        <UiIcon name="edit" size="md" class="text-violet-500" />
      </div>
    </template>

    <template v-if="modalOpen && user">
      <FormUsersBackoffice
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
import { UiIcon } from '~/core/ui/icons'
import { ModalBasic } from '~/core/ui/modal'
import { useUsersStore } from '~/modules/administration/users/store/users.store'
import type { User, UserCreate, UserUpdate } from '~/modules/administration/users/types/users.types'
import FormUsersBackoffice from '../forms/Form.vue'

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
  if (!props.user) return 'Editar usuario backoffice'

  const name = [props.user.firstName, props.user.lastName].filter(Boolean).join(' ').trim()
  if (!name) return 'Editar usuario backoffice'

  return `Editar usuario backoffice - ${name}`
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
