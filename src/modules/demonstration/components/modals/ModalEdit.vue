<template>
  <ModalBasic
    id="edit-demonstration-modal"
    :modal-open="modalOpen"
    title="Editar agendamiento"
    description="Modifica los campos y guarda los cambios."
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
        <svg class="size-5 fill-current text-violet-500" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
        </svg>
      </div>
    </template>

    <FormDemonstration
      v-if="modalOpen && demonstration"
      :key="demonstration.id"
      ref="formRef"
      mode="edit"
      :initial-demonstration="demonstration"
      @submit="handleEdit"
    />

    <template #footer>
      <Button variant="secondary" :disabled="isSubmitting" @click="handleClose">
        Cancelar
      </Button>
      <Button
        variant="primary"
        :loading="isSubmitting"
        :disabled="!demonstration"
        @click="submitForm"
      >
        Guardar
      </Button>
    </template>
  </ModalBasic>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '~/core/ui/buttons'
import { ModalBasic } from '~/core/ui/modal'
import { useDemonstrationsStore } from '../../store/demonstrations.store'
import type { Demonstration, DemonstrationResponse, UpdateDemonstration } from '../../types/demonstration.types'
import FormDemonstration from '../forms/forms.vue'

const props = defineProps<{
  modalOpen: boolean
  demonstration: DemonstrationResponse | null
}>()

const emit = defineEmits<{
  'close-modal': []
  updated: []
}>()

const demonstrationsStore = useDemonstrationsStore()
const formRef = ref<InstanceType<typeof FormDemonstration> | null>(null)
const isSubmitting = ref(false)

const handleClose = () => {
  if (isSubmitting.value) return

  // Igual que ModalEdit de módulos: nunca dejar el backdrop/body lock activos.
  try {
    formRef.value?.reset()
  } finally {
    emit('close-modal')
  }
}

const submitForm = () => {
  formRef.value?.submit()
}

const handleEdit = async (payload: Demonstration | UpdateDemonstration) => {
  const demonstrationId = props.demonstration?.id
  if (isSubmitting.value || !demonstrationId || !('status' in payload)) return

  const demonstrationPayload = payload as UpdateDemonstration

  isSubmitting.value = true

  try {
    await demonstrationsStore.UpdateDemonstration(demonstrationId, demonstrationPayload)
    await demonstrationsStore.getDemonstrations({
      amount: demonstrationsStore.amount,
      page: demonstrationsStore.page,
    })
    formRef.value?.reset()
    emit('updated')
    emit('close-modal')
  } finally {
    isSubmitting.value = false
  }
}
</script>
