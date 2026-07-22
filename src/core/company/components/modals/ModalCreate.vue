<template>
    <ModalBasic
      id="create-company-modal"
      :modal-open="modalOpen"
      :title="modalTitle"
      description="Registra los datos de la empresa."
      size="5xl"
      @close-modal="handleClose"
    >
      <template #icon>
        <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
          <svg class="size-5 fill-current text-violet-500" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
          </svg>
        </div>
      </template>

      <FormCompany
        v-if="modalOpen"
        ref="formRef"
        mode="create"
        @submit="handleCreate"
      />

      <template #footer>
        <Button variant="secondary" :disabled="isSubmitting || isInitializing" @click="handleClose">
          Cancelar
        </Button>
        <Button
          variant="primary"
          :loading="isSubmitting"
          :disabled="isInitializing"
          @click="submitForm"
        >
          Crear empresa
        </Button>
      </template>
    </ModalBasic>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import { Button } from '~/core/ui/buttons'
import { ModalBasic } from '~/core/ui/modal'
import { useCompanyStore } from '../../store/company.store'
import type { CompanyRequestBody } from '../../types/company.types'
import FormCompany from '../forms/form.vue'

const props = defineProps<{
  modalOpen: boolean
}>()

const emit = defineEmits<{
  'close-modal': []
  created: []
}>()

const companyStore = useCompanyStore()
const formRef = ref<InstanceType<typeof FormCompany> | null>(null)
const isSubmitting = ref(false)
const isInitializing = ref(false)

const modalTitle = computed(() => {
  const name = String(formRef.value?.displayName ?? '').trim()
  return name ? `Nueva empresa - ${name}` : 'Nueva empresa'
})

const waitForFormRef = async () => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await nextTick()
    if (formRef.value) return
  }
}

let initializeSeq = 0

watch(
  () => props.modalOpen,
  async (isOpen) => {
    const seq = ++initializeSeq

    if (!isOpen) {
      if (seq === initializeSeq) isInitializing.value = false
      return
    }

    isInitializing.value = true

    try {
      await waitForFormRef()
      if (seq !== initializeSeq) return
      await formRef.value?.initialize()
    } finally {
      if (seq === initializeSeq) isInitializing.value = false
    }
  },
  { immediate: true },
)

const handleClose = () => {
  if (isSubmitting.value) return
  formRef.value?.reset()
  emit('close-modal')
}

const submitForm = () => {
  formRef.value?.submit()
}

const handleCreate = async (payload: CompanyRequestBody) => {
  
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    const createdCompany = await companyStore.createCompany(payload)
    if (createdCompany?.id) {
      await formRef.value?.uploadCompanyLogoIfNeeded(createdCompany.id, { skipNotification: true })
    }
    formRef.value?.reset()
    emit('close-modal')
    emit('created')
  } catch {
    // El cliente API muestra la notificación de error.
  } finally {
    isSubmitting.value = false
  }
}
</script>
