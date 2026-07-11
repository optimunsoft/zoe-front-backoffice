<template>
  <div class="space-y-5">
    <div class="min-w-0">
      <InputField
        label="Activar empresa"
        html-for="company-is-active"
      >
        <div class="flex items-center gap-2">
          <InputSwitch
            id="company-is-active"
            :model-value="form.isActive"
            label="Activar empresa"
            on-label="Activa"
            off-label="Inactiva"
            :disabled="isUpdatingCompanyStatus"
            @update:model-value="onCompanyStatusToggle"
          />
          <Spinner
            v-if="isUpdatingCompanyStatus"
            size="md"
            class="shrink-0 text-violet-500 dark:text-violet-300"
          />
        </div>
      </InputField>
    </div>

    <CompanyModulesSection
      ref="modulesSectionRef"
      class="company-config-panel"
      mode="edit"
      :company-id="companyId"
    />
  </div>

  <ModalAction
    id="confirm-company-status-modal"
    :modal-open="companyStatusModalOpen"
    @close-modal="cancelCompanyStatusChange"
  >
    <div class="text-center">
      <div
        class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full"
        :class="pendingCompanyStatus
          ? 'bg-violet-100 dark:bg-violet-500/20'
          : 'bg-amber-100 dark:bg-amber-500/20'"
      >
        <svg
          class="size-6 fill-current"
          :class="pendingCompanyStatus ? 'text-violet-500' : 'text-amber-500'"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path
            v-if="pendingCompanyStatus"
            d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.7 5.3l-4.2 4.2c-.2.2-.5.2-.7 0L4.3 7.8c-.2-.2-.2-.5 0-.7l.7-.7c.2-.2.5-.2.7 0l1.8 1.8 3.5-3.5c.2-.2.5-.2.7 0l.7.7c.2.2.2.5 0 .7z"
          />
          <path
            v-else
            d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 11H7V7h2v4zm0-6H7V3h2v2z"
          />
        </svg>
      </div>

      <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
        {{ pendingCompanyStatus ? '¿Activar empresa?' : '¿Desactivar empresa?' }}
      </h3>

      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {{
          pendingCompanyStatus
            ? 'La empresa quedará activa y disponible en el sistema.'
            : 'La empresa quedará inactiva y no estará disponible para operaciones.'
        }}
      </p>

      <div class="flex justify-center gap-2">
        <Button
          variant="secondary"
          :disabled="isUpdatingCompanyStatus"
          @click="cancelCompanyStatusChange"
        >
          Cancelar
        </Button>
        <Button
          :variant="pendingCompanyStatus ? 'primary' : 'danger'"
          :loading="isUpdatingCompanyStatus"
          @click="confirmCompanyStatusChange"
        >
          {{ pendingCompanyStatus ? 'Activar' : 'Desactivar' }}
        </Button>
      </div>
    </div>
  </ModalAction>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import InputField from '~/core/ui/inputs/InputField.vue'
import InputSwitch from '~/core/ui/inputs/InputSwitch.vue'
import { Button } from '~/core/ui/buttons'
import { ModalAction } from '~/core/ui/modal'
import { Spinner } from '~/core/ui/loader'
import type { Company } from '../../types/company.types'
import type { CompanyFormValues } from '../../schema/company.schema'
import CompanyModulesSection from './CompanyModulesSection.vue'
import './company-config-panel.css'

defineOptions({
  name: 'CompanyConfigSection',
})

const props = defineProps<{
  form: CompanyFormValues
  isUpdatingCompanyStatus: boolean
  companyId?: string | null
}>()

const emit = defineEmits<{
  'update:isActive': [active: boolean]
}>()

const modulesSectionRef = ref<InstanceType<typeof CompanyModulesSection> | null>(null)

const companyStatusModalOpen = ref(false)
const pendingCompanyStatus = ref<boolean | null>(null)

const onCompanyStatusToggle = (active: boolean) => {
  if (props.isUpdatingCompanyStatus || props.form.isActive === active) return

  pendingCompanyStatus.value = active
  companyStatusModalOpen.value = true
}

const cancelCompanyStatusChange = () => {
  if (props.isUpdatingCompanyStatus) return

  companyStatusModalOpen.value = false
  pendingCompanyStatus.value = null
}

const confirmCompanyStatusChange = () => {
  if (props.isUpdatingCompanyStatus || pendingCompanyStatus.value === null) return

  emit('update:isActive', pendingCompanyStatus.value)
  companyStatusModalOpen.value = false
  pendingCompanyStatus.value = null
}

const reset = () => {
  companyStatusModalOpen.value = false
  pendingCompanyStatus.value = null
  modulesSectionRef.value?.reset()
}

const setFromCompany = async (company: Company) => {
  modulesSectionRef.value?.setModules(company.modules ?? [])
}

defineExpose({
  reset,
  setFromCompany,
})
</script>
