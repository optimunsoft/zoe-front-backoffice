<template>
  <ModalBasic
    id="create-module-modal"
    :modal-open="modalOpen"
    title="Crear módulo"
    description="Completa los datos para registrar un nuevo módulo."
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
        <svg class="size-5 fill-current text-violet-500" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
        </svg>
      </div>
    </template>

    <FormModule ref="formRef" mode="create" @submit="handleCreate" />

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
import { useModulesStore } from '../../store/modules.store'
import type { Module } from '../../types/modules.types'
import FormModule from '../form/form.vue'

defineProps<{
  modalOpen: boolean
}>()

const emit = defineEmits<{
  'close-modal': []
  created: []
}>()

const modulesStore = useModulesStore()
const formRef = ref<InstanceType<typeof FormModule> | null>(null)
const isSubmitting = ref(false)

const handleClose = () => {
  if (isSubmitting.value) return
  formRef.value?.reset()
  emit('close-modal')
}

const submitForm = () => {
  formRef.value?.submit()
}

const handleCreate = async (payload: Module) => {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    await modulesStore.createModule(payload)
    await modulesStore.fetchModules(true)
    formRef.value?.reset()
    emit('created')
    emit('close-modal')
  } finally {
    isSubmitting.value = false
  }
}
</script>
