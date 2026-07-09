<template>
  <ModalBasic
    id="edit-user-modal"
    :modal-open="modalOpen"
    title="Editar usuario"
    description="Actualiza los datos del usuario. El nombre de usuario y el tipo no se pueden modificar."
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

    <FormUser
      v-if="modalOpen && user"
      :key="user.id"
      ref="formRef"
      mode="edit"
      @submit="handleEdit"
    />

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
import { nextTick, ref, watch } from 'vue'

import { Button } from '~/core/ui/buttons'
import { ModalBasic } from '~/core/ui/modal'
import { useUsersStore } from '../../store/users.store'
import type { User, UserUpdate } from '../../types/users.types'
import FormUser from '../forms/Form.vue'

const props = defineProps<{
  modalOpen: boolean
  user: User | null
}>()

const emit = defineEmits<{
  'close-modal': []
  updated: []
}>()

const usersStore = useUsersStore()
const formRef = ref<InstanceType<typeof FormUser> | null>(null)
const isSubmitting = ref(false)

const waitForFormRef = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await nextTick()
    if (formRef.value) return true
  }

  return false
}

const loadUser = async (user: User) => {
  const isReady = await waitForFormRef()
  if (!isReady) return

  await formRef.value?.setValues(user)
}

watch(
  () => [props.modalOpen, props.user] as const,
  async ([isOpen, user]) => {
    if (!isOpen || !user) return

    await nextTick()
    await loadUser(user)
  },
)

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
    await usersStore.updateUser(userId, payload)
    await usersStore.getUsers({
      amount: usersStore.amount,
      page: usersStore.page,
    }, true)
    formRef.value?.reset()
    emit('updated')
    emit('close-modal')
  } finally {
    isSubmitting.value = false
  }
}
</script>
