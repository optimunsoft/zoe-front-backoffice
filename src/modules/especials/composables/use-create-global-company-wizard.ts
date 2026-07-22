import { computed, ref } from 'vue'

import { useCompanyService } from '~/core/company/services/company.service'
import { useCompanyStore } from '~/core/company/store/company.store'
import { ActiveModule, type CompanyRequestBody } from '~/core/company/types/company.types'
import { useToast } from '~/core/ui/toast'
import { useUsersStore } from '~/modules/administration/users/store/users.store'
import type { UserCreate } from '~/modules/administration/users/types/users.types'
import { useUsersService } from '~/modules/administration/users/services/users.services'

import {
  extractCreatedCompanyId,
  extractCreatedUserId,
} from '../utils/created-entity-id.utils'

export const WIZARD_STEPS = [
  { key: 'user', label: 'Crear usuario' },
  { key: 'company', label: 'Crear empresa' },
  { key: 'logo', label: 'Logo de la empresa' },
  { key: 'modules', label: 'Asignar módulos' },
] as const

export type WizardStepKey = typeof WIZARD_STEPS[number]['key']

export type WizardDrafts = {
  user: UserCreate | null
  company: Omit<CompanyRequestBody, 'ownerUserId'> | null
  logo: File | null
  moduleIds: string[]
}

type CreatedState = {
  userId: string | null
  companyId: string | null
  assignedModuleIds: string[]
}

const emptyDrafts = (): WizardDrafts => ({
  user: null,
  company: null,
  logo: null,
  moduleIds: [],
})

const emptyCreated = (): CreatedState => ({
  userId: null,
  companyId: null,
  assignedModuleIds: [],
})

export function useCreateGlobalCompanyWizard() {
  const toast = useToast()
  const usersStore = useUsersStore()
  const companyStore = useCompanyStore()
  const usersService = useUsersService()
  const companyService = useCompanyService()

  const currentStepIndex = ref(0)
  const isSubmitting = ref(false)
  const submitProgressLabel = ref('')
  const drafts = ref<WizardDrafts>(emptyDrafts())
  const failedStepLabel = ref<string | null>(null)

  const currentStep = computed(() => {
    const step = WIZARD_STEPS[currentStepIndex.value]
    if (step) return step
    return { key: 'user' as const, label: 'Crear usuario' }
  })
  const isFirstStep = computed(() => currentStepIndex.value === 0)
  const isLastStep = computed(() => currentStepIndex.value === WIZARD_STEPS.length - 1)

  const missingRequirements = computed(() => {
    const missing: string[] = []
    if (!drafts.value.user) missing.push('Crear usuario')
    if (!drafts.value.company) missing.push('Crear empresa')
    return missing
  })

  const canSubmitAll = computed(() => missingRequirements.value.length === 0)

  const goNext = () => {
    if (isLastStep.value) return
    currentStepIndex.value += 1
  }

  const goBack = () => {
    if (isFirstStep.value) return
    currentStepIndex.value -= 1
  }

  const setUserDraft = (payload: UserCreate) => {
    drafts.value.user = payload
  }

  const setCompanyDraft = (payload: CompanyRequestBody) => {
    const { ownerUserId: _ownerUserId, ...rest } = payload
    drafts.value.company = {
      ...rest,
      production: true,
    }
  }

  const setLogoDraft = (file: File | null) => {
    drafts.value.logo = file
  }

  const setModuleIdsDraft = (moduleIds: string[]) => {
    drafts.value.moduleIds = [...moduleIds]
  }

  const resetWizard = () => {
    currentStepIndex.value = 0
    isSubmitting.value = false
    submitProgressLabel.value = ''
    drafts.value = emptyDrafts()
    failedStepLabel.value = null
  }

  const rollbackCreated = async (created: CreatedState) => {
    for (const moduleId of [...created.assignedModuleIds].reverse()) {
      if (!created.companyId) break
      try {
        await companyService.assignModulesToCompany(
          moduleId,
          created.companyId,
          ActiveModule.INACTIVO,
          { skipNotification: true },
        )
      } catch {
        // Best-effort rollback.
      }
    }

    if (created.companyId && created.userId) {
      try {
        await companyService.unassignUsersFromCompany(
          created.companyId,
          created.userId,
          { skipNotification: true },
        )
      } catch {
        // Best-effort rollback.
      }
    }

    if (created.companyId) {
      try {
        await companyService.getStatusCompanies(created.companyId, false, {
          skipNotification: true,
        })
      } catch {
        // Best-effort rollback.
      }
    }

    if (created.userId) {
      try {
        await usersService.changesStatusUser(created.userId, false, {
          skipNotification: true,
        })
      } catch {
        // Best-effort rollback.
      }
    }
  }

  /**
   * Ejecuta los endpoints en orden estricto al pulsar Enviar:
   * 1. usersStore.createUser → userId
   * 2. companyStore.createCompany(ownerUserId: userId) → companyId
   * 3. companyStore.uploadCompanyLogo(companyId, logo)
   * 4. companyStore.assignModulesToCompany(companyId, moduleId) por cada módulo
   */
  const submitAll = async (options?: {
    logo?: File | null
    moduleIds?: string[]
  }): Promise<boolean> => {
    if (isSubmitting.value) return false
    if (!canSubmitAll.value || !drafts.value.user || !drafts.value.company) {
      const pending = missingRequirements.value.join(', ')
      toast.error(
        pending
          ? `No se puede enviar. Completa: ${pending}.`
          : 'Faltan datos del usuario o de la empresa.',
      )
      return false
    }

    const logoFile = options?.logo ?? drafts.value.logo
    const moduleIds = [...(options?.moduleIds ?? drafts.value.moduleIds)]

    // Mantener drafts sincronizados con lo que se envía.
    drafts.value.logo = logoFile ?? null
    drafts.value.moduleIds = moduleIds

    isSubmitting.value = true
    submitProgressLabel.value = 'Creando usuario'
    failedStepLabel.value = null
    const created = emptyCreated()

    try {
      // 1. createUser → userId para el siguiente paso
      failedStepLabel.value = WIZARD_STEPS[0].label
      const { isAdmin: _isAdmin, isVerified: _isVerified, ...userPayload } = drafts.value.user
      const userResponse = await usersStore.createUser(userPayload as UserCreate)
      const userId = extractCreatedUserId(userResponse)
      if (!userId) {
        throw new Error('No se pudo obtener el ID del usuario creado.')
      }
      created.userId = userId

      // 2. createCompany(ownerUserId) → companyId para logo y módulos
      submitProgressLabel.value = 'Creando empresa'
      failedStepLabel.value = WIZARD_STEPS[1].label
      const createdCompany = await companyStore.createCompany({
        ...drafts.value.company,
        ownerUserId: userId,
        production: true,
      })
      const companyId = extractCreatedCompanyId(createdCompany)
      if (!companyId) {
        throw new Error('No se pudo obtener el ID de la empresa creada.')
      }
      created.companyId = companyId

      // 3. uploadCompanyLogo(companyId, file)
      if (logoFile) {
        submitProgressLabel.value = 'Asignando logo'
        failedStepLabel.value = WIZARD_STEPS[2].label
        await companyStore.uploadCompanyLogo(companyId, logoFile, {
          skipNotification: true,
        })
      }

      // 4. assignModulesToCompany(companyId, moduleId)
      if (moduleIds.length > 0) {
        submitProgressLabel.value = 'Asignando módulos'
        failedStepLabel.value = WIZARD_STEPS[3].label
        for (const moduleId of moduleIds) {
          const normalizedModuleId = String(moduleId ?? '').trim()
          if (!normalizedModuleId) continue

          await companyStore.assignModulesToCompany(
            companyId,
            normalizedModuleId,
            ActiveModule.ACTIVO,
          )
          created.assignedModuleIds.push(normalizedModuleId)
        }
      }

      failedStepLabel.value = null
      toast.success('Registro completo creado correctamente.')
      return true
    } catch (error) {
      const stepLabel = failedStepLabel.value ?? 'desconocido'
      await rollbackCreated(created)
      const detail = error instanceof Error && error.message
        ? ` ${error.message}`
        : ''
      toast.error(
        `Error en el paso "${stepLabel}". Se revirtió lo creado hasta ese punto.${detail}`,
      )
      return false
    } finally {
      isSubmitting.value = false
      submitProgressLabel.value = ''
    }
  }

  return {
    WIZARD_STEPS,
    currentStepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    isSubmitting,
    submitProgressLabel,
    drafts,
    missingRequirements,
    canSubmitAll,
    failedStepLabel,
    goNext,
    goBack,
    setUserDraft,
    setCompanyDraft,
    setLogoDraft,
    setModuleIdsDraft,
    resetWizard,
    submitAll,
  }
}
