<template>
  <ModalBasic
    id="edit-company-modal"
    :modal-open="modalOpen"
    title="Editar empresa"
    description="Modifica los datos de la empresa."
    size="5xl"
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
        <svg class="size-5 fill-current text-violet-500" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
        </svg>
      </div>
    </template>

    <FormCompany
      v-if="modalOpen && company"
      :key="company.id"
      ref="formRef"
      mode="edit"
      @submit="handleEdit"
      @status-updated="handleStatusUpdated"
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
        Guardar cambios
      </Button>
    </template>
  </ModalBasic>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

import { Button } from '~/core/ui/buttons'
import { ModalBasic } from '~/core/ui/modal'
import { useCompanyStore } from '../../store/company.store'
import type { Company, CompanyUpdateRequestBody } from '../../types/company.types'
import FormCompany from '../forms/form.vue'

const props = defineProps<{
  modalOpen: boolean
  company: Company | null
}>()

const emit = defineEmits<{
  'close-modal': []
  updated: []
  'status-updated': [active: boolean]
}>()

const companyStore = useCompanyStore()
const formRef = ref<InstanceType<typeof FormCompany> | null>(null)
const isSubmitting = ref(false)
const isInitializing = ref(false)

const waitForFormRef = async () => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await nextTick()
    if (formRef.value) return
  }
}

watch(
  () => [props.modalOpen, props.company] as const,
  async ([isOpen, company]) => {
    if (!isOpen || !company) {
      isInitializing.value = false
      return
    }

    isInitializing.value = true

    try {
      await waitForFormRef()
      await formRef.value?.initialize(company)
    } finally {
      isInitializing.value = false
    }
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

const handleStatusUpdated = (active: boolean) => {
  emit('status-updated', active)
}

const handleEdit = async (payload: CompanyUpdateRequestBody) => {
  if (isSubmitting.value || !props.company?.id) return

  isSubmitting.value = true

  try {
    await companyStore.updateCompany(props.company.id, payload)
    formRef.value?.reset()
    emit('close-modal')
    emit('updated')
  } catch {
    // El cliente API muestra la notificación de error.
  } finally {
    isSubmitting.value = false
  }
}
</script>
