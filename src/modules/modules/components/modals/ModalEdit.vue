<template>
  <ModalBasic
    id="edit-module-modal"
    :modal-open="modalOpen"
    title="Editar módulo"
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

    <FormModule
      v-if="modalOpen && module"
      :key="module.id || module.code"
      ref="formRef"
      mode="edit"
      :initial-module="module"
      @submit="handleEdit"
    />

    <template #footer>
      <Button variant="secondary" :disabled="isSubmitting" @click="handleClose">
        Cancelar
      </Button>
      <Button
        variant="primary"
        :loading="isSubmitting"
        :disabled="!module"
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
import { useModulesStore } from '../../store/modules.store'
import type { Module, ModuleList } from '../../types/modules.types'
import FormModule from '../form/form.vue'

const props = defineProps<{
  modalOpen: boolean
  module: ModuleList | null
}>()

const emit = defineEmits<{
  'close-modal': []
  updated: []
}>()

const modulesStore = useModulesStore()
const formRef = ref<InstanceType<typeof FormModule> | null>(null)
const isSubmitting = ref(false)

const handleClose = () => {
  if (isSubmitting.value) return

  // Siempre emitir cierre: si reset falla, no dejar el backdrop/body lock activos.
  try {
    formRef.value?.reset()
  } finally {
    emit('close-modal')
  }
}

const submitForm = () => {
  formRef.value?.submit()
}

const handleEdit = async (payload: Module) => {
  const moduleId = props.module?.id
  if (isSubmitting.value || !moduleId) return

  isSubmitting.value = true

  try {
    await modulesStore.updateModule(moduleId, payload)
    await modulesStore.fetchModules(true)
    formRef.value?.reset()
    emit('updated')
    emit('close-modal')
  } finally {
    isSubmitting.value = false
  }
}
</script>
