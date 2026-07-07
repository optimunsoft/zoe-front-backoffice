<template>
    <ModalBasic
      id="create-demonstration-modal"
      :modal-open="modalOpen"
      title="Crear demostración"
      description="Completa los datos para registrar una nueva demostración."
      @close-modal="handleClose"
    >
      <template #icon>
        <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
          <svg class="size-5 fill-current text-violet-500" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
          </svg>
        </div>
      </template>

      <FormDemonstration ref="formRef" @submit="handleCreate" />

      <template #footer>
        <Button variant="secondary" :disabled="isSubmitting" @click="handleClose">
          Cancelar
        </Button>
        <Button variant="primary" :loading="isSubmitting" @click="submitForm">
          Crear
        </Button>
      </template>
    </ModalBasic>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '~/core/ui/buttons'
import { ModalBasic } from '~/core/ui/modal'
import { useDemonstrationsStore } from '../../store/demonstrations.store'
import type { Demonstration } from '../../types/demonstration.types'
import FormDemonstration from '../forms/forms.vue'

defineProps<{
  modalOpen: boolean
}>()

const emit = defineEmits<{
  'close-modal': []
  created: []
}>()

const demonstrationsStore = useDemonstrationsStore()
const formRef = ref<InstanceType<typeof FormDemonstration> | null>(null)
const isSubmitting = ref(false)

const handleClose = () => {
  if (isSubmitting.value) return
  formRef.value?.reset()
  emit('close-modal')
}

const submitForm = () => {
  formRef.value?.submit()
}

const handleCreate = async (demonstration: Demonstration) => {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    await demonstrationsStore.createDemonstration(demonstration)
    await demonstrationsStore.getDemonstrations({
      amount: demonstrationsStore.amount,
      page: demonstrationsStore.page,
    })
    formRef.value?.reset()
    emit('created')
    emit('close-modal')
  } finally {
    isSubmitting.value = false
  }
}
</script>
