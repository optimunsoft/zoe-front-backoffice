<template>
  <ModalBasic
    id="create-global-company-modal"
    :modal-open="modalOpen"
    :title="modalTitle"
    :description="currentStepDescription"
    size="6xl"
    motion="gentle"
    hide-body-fade
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-brand-500/15 dark:bg-brand-500/20">
        <UiIcon name="company" size="sm" class="text-brand-600 dark:text-brand-300" />
      </div>
    </template>

    <div class="relative min-h-0">
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
          first-name-label="Nombre del usuario"
          last-name-label="Apellido del usuario"
          email-label="Correo electrónico del usuario"
          municipality-label="Municipio del usuario"
          phone-label="Celular del usuario"
          :show-backoffice-section="false"
          @submit="onUserStepSubmit"
        />
      </div>

      <div
        v-show="stepKey === 'company' || stepKey === 'company-additional'"
        class="relative flex flex-col gap-4"
        :aria-busy="statusRut || undefined"
      >
        <div
          v-if="statusRut"
          class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-lg bg-white/85 backdrop-blur-[1px] dark:bg-gray-800/85"
          aria-live="polite"
        >
          <Spinner
            size="lg"
            class="text-violet-500 dark:text-violet-300"
          />
          <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
            Procesando documento...
          </p>
        </div>

        <div v-show="stepKey === 'company'">
          <input
            ref="rutInputRef"
            type="file"
            class="sr-only"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            @change="onRutFileChange"
          >
          <p class="text-sm text-gray-500 dark:text-gray-400 pb-4">
            Sube el RUT de la empresa para completar los datos automáticamente.
          </p>
          <Tooltip bg="light" position="top" size="sm">
            <template #trigger>
             
              <Button type="button" variant="secondary" :loading="statusRut" :disabled="statusRut" @click="openRutPicker">
                <template #icon>
                  <UiIcon name="upload" size="sm" />
                </template>
                Subir RUT
              </Button>
            </template>
            <div class="max-w-xs text-xs font-medium">
              Sube el RUT de la empresa para completar los datos automáticamente.
            </div>
          </Tooltip>
        </div>
        <div class="min-w-0">
          <FormCompanyEspecials
            v-if="companyStepMounted"
            ref="companyFormRef"
            :production="true"
            :section="companyFormSection"
            :disabled="statusRut"
            @submit="onCompanyStepSubmit"
          />
        </div>
      </div>

      <div v-show="stepKey === 'logo'" class="mx-auto w-full max-w-xl">
        <InputFileUpload
          id="wizard-company-logo"
          v-model="logoFile"
          class="block w-full"
          label="Logo"
          preview-size="lg"
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
import { useCompanyStore } from '~/core/company/store/company.store'
import type { CompanyRequestBody, CompanyUpdateRequestBody } from '~/core/company/types/company.types'
import { Button } from '~/core/ui/buttons'
import { UiIcon } from '~/core/ui/icons'
import InputFileUpload from '~/core/ui/inputs/InputFileUpload.vue'
import { Spinner } from '~/core/ui/loader'
import { ModalBasic } from '~/core/ui/modal'
import { useNotificationAlertStore } from '~/core/ui/notifications'
import { Tooltip } from '~/core/ui/Utooltip'
import FormUser from '~/modules/administration/users/components/forms/Form.vue'
import type { UserCreate, UserUpdate } from '~/modules/administration/users/types/users.types'
import { useModulesStore } from '~/modules/modules/store/modules.store'

import FormCompanyEspecials from '../forms/FormCompanyEspecials.vue'
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
const companyStore = useCompanyStore()
const notificationAlert = useNotificationAlertStore()

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
const companyFormRef = ref<InstanceType<typeof FormCompanyEspecials> | null>(null)
const companyStepMounted = ref(false)
const isAdvancing = ref(false)
const pendingUserAdvance = ref(false)
const pendingCompanyAdvance = ref(false)
const logoFile = ref<File | null>(null)
const rutFile = ref<File | null>(null)
const rutInputRef = ref<HTMLInputElement | null>(null)
const moduleIds = ref<string[]>([])
const logoAccept = '.png,.jpg,.jpeg,image/png,image/jpeg'
const statusRut = ref(false)

let prepareSeq = 0
let preparePromise: Promise<void> | null = null
let isCompanyFormPrepared = false

const stepKey = computed(() => unref(currentStep)?.key ?? 'user')
const companyFormSection = computed(() =>
  stepKey.value === 'company-additional' ? 'additional' as const : 'general' as const,
)
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
      return 'Paso 1 de 5: crea el usuario dueño de la empresa.'
    case 'company':
      return 'Paso 2 de 5: completa la información general (puedes subir el RUT).'
    case 'company-additional':
      return 'Paso 3 de 5: completa la información adicional requerida.'
    case 'logo':
      return 'Paso 4 de 5: carga el logo (opcional).'
    case 'modules':
      return 'Paso 5 de 5: asigna módulos (opcional) y envía.'
    default:
      return 'Completa el registro en 5 pasos.'
  }
})

const uploadRutFile = async (file: File) => {
  // Prefill: sin alerta de éxito (solo al enviar el registro completo).
  return companyStore.getCompanyRut(file, { skipNotification: true })
}

const openRutPicker = () => {
  rutInputRef.value?.click()
}

const onRutFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  input.value = ''
  if (!file) return

  rutFile.value = file
  await getCompanyRut(file)
}

const getCompanyRut = async (file: File) => {
  if (statusRut.value) return

  statusRut.value = true
  try {
    const prefill = await uploadRutFile(file)

    await waitForCompanyForm()
    if (!companyFormRef.value || !prefill) return

    // Asigna valores sin esperar el sync del municipio para no dejar el overlay colgado.
    void companyFormRef.value.setFormValues({
      ownerUserId: '',
      taxResponsibilityId: '',
      vatRegimeId: '',
      documentTypeId: prefill.documentTypeId ?? '',
      businessNatureId: (prefill as { businessNatureId?: string }).businessNatureId ?? '',
      municipalityId: prefill.municipalityId ?? '',
      documentNumber: prefill.documentNumber ?? '',
      businessName: prefill.businessName ?? '',
      firstName: prefill.firstName ?? '',
      middleName: prefill.middleName ?? '',
      lastName: prefill.lastName ?? '',
      secondLastName: prefill.secondLastName ?? '',
      email: prefill.email ?? '',
      address: prefill.address ?? '',
    })
  } catch {
    // El error ya se maneja por la capa de API / notificación.
  } finally {
    statusRut.value = false
  }
}

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
    const ok = companyFormRef.value?.validateGeneral() ?? false
    if (ok) goNext()
    isAdvancing.value = false
    return
  }

  if (stepKey.value === 'company-additional') {
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

  // Cancelar: no mostrar alertas de éxito encoladas (p. ej. RUT u otras mutaciones intermedias).
  notificationAlert.clearPending('success')

  userFormRef.value?.reset()
  companyFormRef.value?.reset()
  resetWizard()
  logoFile.value = null
  moduleIds.value = []
  emit('close-modal')
}
</script>
