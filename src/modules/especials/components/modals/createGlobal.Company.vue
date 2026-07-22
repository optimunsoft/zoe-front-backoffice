<template>
  <ModalBasic
    id="create-global-company-modal"
    :modal-open="modalOpen"
    :title="modalTitle"
    :description="currentStepDescription"
    size="6xl"
    motion="gentle"
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-brand-500/15 dark:bg-brand-500/20">
        <UiIcon name="company" size="sm" class="text-brand-600 dark:text-brand-300" />
      </div>
    </template>

    <div class="relative min-h-72">
      <div
        v-if="isSubmitting"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-lg bg-white/85 backdrop-blur-[1px] dark:bg-gray-800/85"
        aria-live="polite"
        aria-busy="true"
      >
        <Spinner
          size="lg"
          class="text-violet-500 dark:text-violet-300"
        />
        <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
          {{ submitProgressLabel || 'Procesando...' }}
        </p>
      </div>

      <WizardStepIndicator
        :steps="WIZARD_STEPS"
        :current-index="currentStepIndex"
      />

      <div v-show="stepKey === 'user'">
        <FormUser
          v-if="modalOpen"
          ref="userFormRef"
          mode="create"
          :show-backoffice-section="false"
          @submit="onUserStepSubmit"
        />
      </div>

      <div v-show="stepKey === 'company'">
        <FormCompany
          v-if="companyStepMounted"
          ref="companyFormRef"
          mode="create"
          hide-owner-field
          hide-production-field
          :production="true"
          @submit="onCompanyStepSubmit"
        />
      </div>

      <div v-show="stepKey === 'logo'" class="mx-auto w-[50%]">
        <InputFileUpload
          id="wizard-company-logo"
          v-model="logoFile"
          class="block w-full"
          label="Logo"
          :accept="logoAccept"
          :max-size-mb="5"
          help-text="PNG o JPEG, máximo 5 MB"
        />
      </div>

      <div v-show="stepKey === 'modules'">
        <WizardStepModules v-model="moduleIds" />

        <p
          v-if="!canSubmitAll"
          class="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
        >
          Para enviar el registro completo debes finalizar:
          <span class="font-medium">{{ missingRequirementsLabel }}</span>.
          Usa <span class="font-medium">Anterior</span> para completar los pasos pendientes.
        </p>
      </div>
    </div>

    <template #footer>
      <Button
        variant="secondary"
        :disabled="isSubmitting"
        @click="handleClose"
      >
        Cancelar
      </Button>

      <Button
        v-if="!isFirstStep"
        variant="tertiary"
        :disabled="isSubmitting"
        @click="goBack"
      >
        Anterior
      </Button>

      <Button
        v-if="!isLastStep"
        variant="primary"
        :disabled="isSubmitting || isAdvancing"
        :loading="isAdvancing"
        @click="handleNext"
      >
        Siguiente
      </Button>

      <Button
        v-else
        variant="primary"
        :disabled="isSubmitting || !canSubmitAll"
        @click="handleSubmitAll"
      >
        Enviar
      </Button>
    </template>
  </ModalBasic>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, unref, watch } from 'vue'

import { useCatalogStore } from '~/core/catalog/store/catalog.store'
import FormCompany from '~/core/company/components/forms/form.vue'
import type { CompanyRequestBody, CompanyUpdateRequestBody } from '~/core/company/types/company.types'
import { Button } from '~/core/ui/buttons'
import { UiIcon } from '~/core/ui/icons'
import InputFileUpload from '~/core/ui/inputs/InputFileUpload.vue'
import { Spinner } from '~/core/ui/loader'
import { ModalBasic } from '~/core/ui/modal'
import FormUser from '~/modules/administration/users/components/forms/Form.vue'
import type { UserCreate, UserUpdate } from '~/modules/administration/users/types/users.types'
import { useModulesStore } from '~/modules/modules/store/modules.store'

import WizardStepIndicator from '../wizard/WizardStepIndicator.vue'
import WizardStepModules from '../wizard/WizardStepModules.vue'
import { useCreateGlobalCompanyWizard } from '../../composables/use-create-global-company-wizard'

const props = defineProps<{
  modalOpen: boolean
}>()

const emit = defineEmits<{
  'close-modal': []
  created: []
}>()

const catalogStore = useCatalogStore()
const modulesStore = useModulesStore()

const {
  WIZARD_STEPS,
  currentStepIndex,
  currentStep,
  isFirstStep,
  isLastStep,
  isSubmitting,
  submitProgressLabel,
  missingRequirements,
  canSubmitAll,
  goNext,
  goBack,
  setUserDraft,
  setCompanyDraft,
  setLogoDraft,
  setModuleIdsDraft,
  resetWizard,
  submitAll,
} = useCreateGlobalCompanyWizard()

const userFormRef = ref<InstanceType<typeof FormUser> | null>(null)
const companyFormRef = ref<InstanceType<typeof FormCompany> | null>(null)
const companyStepMounted = ref(false)
const isAdvancing = ref(false)
const pendingUserAdvance = ref(false)
const pendingCompanyAdvance = ref(false)
const logoFile = ref<File | null>(null)
const moduleIds = ref<string[]>([])
const logoAccept = '.png,.jpg,.jpeg,image/png,image/jpeg'

let prepareSeq = 0
let preparePromise: Promise<void> | null = null
let isCompanyFormPrepared = false

const stepKey = computed(() => unref(currentStep)?.key ?? 'user')
const missingRequirementsLabel = computed(() =>
  unref(missingRequirements).join(', '),
)

const modalTitle = computed(() => {
  const name = String(companyFormRef.value?.displayName ?? '').trim()
  if (name) return `Registro completo - ${name}`
  return 'Registro Completo de empresas'
})

const currentStepDescription = computed(() => {
  switch (stepKey.value) {
    case 'user':
      return 'Paso 1 de 4: crea el usuario dueño de la empresa.'
    case 'company':
      return 'Paso 2 de 4: completa los datos de la empresa.'
    case 'logo':
      return 'Paso 3 de 4: carga el logo (opcional).'
    case 'modules':
      return 'Paso 4 de 4: asigna módulos (opcional) y envía.'
    default:
      return 'Completa el registro en 4 pasos.'
  }
})

const waitForCompanyForm = async () => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await nextTick()
    if (companyFormRef.value) return
  }
}

const preloadCompanyFormDependencies = async () => {
  await Promise.all([
    catalogStore.preload(),
    modulesStore.getModules({}, false),
  ])
}

const prepareCompanyForm = () => {
  if (isCompanyFormPrepared) return Promise.resolve()
  if (preparePromise) return preparePromise

  const seq = ++prepareSeq

  preparePromise = (async () => {
    try {
      await preloadCompanyFormDependencies()
      if (seq !== prepareSeq) return

      companyStepMounted.value = true
      await waitForCompanyForm()
      if (seq !== prepareSeq) return

      await companyFormRef.value?.initialize()
      if (seq === prepareSeq) isCompanyFormPrepared = true
    } finally {
      if (seq === prepareSeq) preparePromise = null
    }
  })()

  return preparePromise
}

watch(
  () => props.modalOpen,
  async (isOpen) => {
    if (!isOpen) {
      prepareSeq += 1
      preparePromise = null
      isCompanyFormPrepared = false
      companyStepMounted.value = false
      return
    }

    resetWizard()
    logoFile.value = null
    moduleIds.value = []
    pendingUserAdvance.value = false
    pendingCompanyAdvance.value = false
    isAdvancing.value = false
    companyStepMounted.value = false
    preparePromise = null
    isCompanyFormPrepared = false

    await nextTick()
    userFormRef.value?.reset()
    void prepareCompanyForm()
  },
)

watch(logoFile, (file) => {
  setLogoDraft(file)
})

watch(moduleIds, (ids) => {
  setModuleIdsDraft(ids)
}, { deep: true })

const onUserStepSubmit = async (payload: UserCreate | UserUpdate) => {
  if (!pendingUserAdvance.value) return
  pendingUserAdvance.value = false

  const { isAdmin: _isAdmin, isVerified: _isVerified, ...createPayload } = payload as UserCreate
  setUserDraft(createPayload as UserCreate)

  try {
    await prepareCompanyForm()
    goNext()
  } finally {
    isAdvancing.value = false
  }
}

const onCompanyStepSubmit = (payload: CompanyRequestBody | CompanyUpdateRequestBody) => {
  if (!pendingCompanyAdvance.value) return
  pendingCompanyAdvance.value = false

  setCompanyDraft(payload as CompanyRequestBody)
  isAdvancing.value = false
  goNext()
}

const handleNext = async () => {
  if (isSubmitting.value || isAdvancing.value) return

  if (stepKey.value === 'user') {
    isAdvancing.value = true
    pendingUserAdvance.value = true
    userFormRef.value?.submit()
    await nextTick()
    // If validation failed, submit won't emit.
    window.setTimeout(() => {
      if (pendingUserAdvance.value) {
        pendingUserAdvance.value = false
        isAdvancing.value = false
      }
    }, 0)
    return
  }

  if (stepKey.value === 'company') {
    isAdvancing.value = true
    pendingCompanyAdvance.value = true
    companyFormRef.value?.submit()
    await nextTick()
    window.setTimeout(() => {
      if (pendingCompanyAdvance.value) {
        pendingCompanyAdvance.value = false
        isAdvancing.value = false
      }
    }, 0)
    return
  }

  if (stepKey.value === 'logo') {
    setLogoDraft(logoFile.value)
    goNext()
  }
}

const handleSubmitAll = async () => {
  if (!unref(canSubmitAll)) return

  // Pasa logo y módulos explícitamente: el companyId sale del create y alimenta estos pasos.
  const ok = await submitAll({
    logo: logoFile.value,
    moduleIds: [...moduleIds.value],
  })
  if (!ok) return

  userFormRef.value?.reset()
  companyFormRef.value?.reset()
  resetWizard()
  logoFile.value = null
  moduleIds.value = []
  emit('created')
  emit('close-modal')
}

const handleClose = () => {
  if (isSubmitting.value) return

  userFormRef.value?.reset()
  companyFormRef.value?.reset()
  resetWizard()
  logoFile.value = null
  moduleIds.value = []
  emit('close-modal')
}
</script>
