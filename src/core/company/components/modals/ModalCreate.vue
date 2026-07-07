<template>
    <ModalBasic
      id="create-company-modal"
      :modal-open="modalOpen"
      title="Nueva empresa"
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

      <FormCompany ref="formRef" @submit="handleCreate" />

      <template #footer>
        <Button variant="secondary" :disabled="isSubmitting" @click="handleClose">
          Cancelar
        </Button>
        <Button variant="primary" :loading="isSubmitting" @click="submitForm">
          Crear empresa
        </Button>
      </template>
    </ModalBasic>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '~/core/ui/buttons'
import { ModalBasic } from '~/core/ui/modal'
import { useToast } from '~/core/ui/toast'
import { useCompanyStore } from '../../store/company.store'
import type { CompanyRequestBody } from '../../types/company.types'
import FormCompany from '../forms/form.vue'

defineProps<{
  modalOpen: boolean
}>()

const emit = defineEmits<{
  'close-modal': []
  created: []
}>()

const companyStore = useCompanyStore()
const toast = useToast()
const formRef = ref<InstanceType<typeof FormCompany> | null>(null)
const isSubmitting = ref(false)

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
    await companyStore.createCompany(payload)
    await companyStore.getCompanies({
      amount: companyStore.amount,
      page: companyStore.page,
    }, true)
    formRef.value?.reset()
    toast.success('Empresa creada correctamente.')
    emit('created')
    emit('close-modal')
  } catch {
    toast.error('No se pudo crear la empresa. Intenta de nuevo.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
