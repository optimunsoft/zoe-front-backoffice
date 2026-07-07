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
    />

    <template #footer>
      <Button variant="secondary" :disabled="isSubmitting" @click="handleClose">
        Cancelar
      </Button>
      <Button variant="primary" :loading="isSubmitting" @click="submitForm">
        Guardar cambios
      </Button>
    </template>
  </ModalBasic>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

import { Button } from '~/core/ui/buttons'
import { ModalBasic } from '~/core/ui/modal'
import { useToast } from '~/core/ui/toast'
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
}>()

const companyStore = useCompanyStore()
const toast = useToast()
const formRef = ref<InstanceType<typeof FormCompany> | null>(null)
const isSubmitting = ref(false)

const waitForFormRef = async () => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await nextTick()
    if (formRef.value) return
  }
}

const loadCompany = async (company: Company) => {
  await waitForFormRef()
  await formRef.value?.setValues(company)
}

watch(
  () => [props.modalOpen, props.company] as const,
  async ([isOpen, company]) => {
    if (!isOpen || !company) return

    await nextTick()
    await loadCompany(company)
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

const handleEdit = async (payload: CompanyUpdateRequestBody) => {
  if (isSubmitting.value || !props.company?.id) return

  isSubmitting.value = true

  try {
    await companyStore.updateCompany(props.company.id, payload)
    await companyStore.getCompanies({
      amount: companyStore.amount,
      page: companyStore.page,
    }, true)

    formRef.value?.reset()
    toast.success('Empresa actualizada correctamente.')
    emit('updated')
    emit('close-modal')
  } catch {
    toast.error('No se pudo actualizar la empresa. Intenta de nuevo.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
