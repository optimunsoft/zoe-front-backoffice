<template>
  <ModalBasic
    id="company-user-permissions-modal"
    :modal-open="modalOpen"
    :title="modalTitle"
    :description="modalDescription"
    size="5xl"
    hide-body-fade
    body-class="!flex !h-0 !min-h-0 !flex-1 !flex-col !overflow-hidden !p-0"
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
        <UiIcon name="permissions" size="md" class="text-violet-500" />
      </div>
    </template>

    <div
      v-if="modalOpen && user"
      class="flex h-0 min-h-0 flex-1 flex-col"
    >
      <div
        v-if="hasMultipleRoles"
        class="shrink-0 border-b border-gray-200 px-6 py-4 dark:border-gray-700/60"
      >
        <div class="max-w-xs">
          <InputSelect
            v-model="selectedRoleId"
            label="Rol"
            :options="roleOptions"
          />
        </div>
      </div>

      <SettingsPanelLayout layout-class="h-0 min-h-0 flex-1">
        <template #sidebar>
          <SettingsNav
            v-if="!isLoadingPermissions && !permissionsError && moduleNavItems.length"
            v-model="selectedModuleId"
            :items="moduleNavItems"
            group-title="Módulos"
          />

          <p
            v-else-if="isLoadingPermissions"
            class="px-3 py-6 text-sm text-gray-500 dark:text-gray-400"
          >
            Cargando módulos...
          </p>

          <p
            v-else-if="permissionsError"
            class="px-3 py-6 text-sm text-gray-500 dark:text-gray-400"
          >
            No se pudieron cargar los módulos.
          </p>

          <p
            v-else
            class="px-3 py-6 text-sm text-gray-500 dark:text-gray-400"
          >
            Sin módulos disponibles.
          </p>
        </template>

        <template #panel>
          <CompanyRolePermissionsPanel
            :module="selectedModule"
            :loading="isLoadingPermissions"
            :error="permissionsError"
            :has-modules="moduleNavItems.length > 0"
          />
        </template>
      </SettingsPanelLayout>
    </div>

    <template #footer>
      <Button variant="secondary" @click="handleClose">
        Cerrar
      </Button>
    </template>
  </ModalBasic>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import CompanyRolePermissionsPanel from '../panels/CompanyRolePermissionsPanel.vue'
import { groupPermissionsByProduct } from '../../mappers/company-permissions.mapper'
import { useCompanyStore } from '../../store/company.store'
import type { CompanyRolePermissions, userCompany } from '../../types/company.types'
import { Button } from '~/core/ui/buttons'
import { InputSelect } from '~/core/ui/inputs'
import { UiIcon } from '~/core/ui/icons'
import { ModalBasic } from '~/core/ui/modal'
import { SettingsNav, SettingsPanelLayout } from '~/core/ui/settings'
import type { SettingsNavItem } from '~/core/ui/settings'

const props = defineProps<{
  modalOpen: boolean
  companyId: string
  companyName: string
  user: userCompany | null
}>()

const emit = defineEmits<{
  'close-modal': []
}>()

const companyStore = useCompanyStore()

const selectedRoleId = ref('')
const selectedModuleId = ref('')
const rolePermissions = ref<CompanyRolePermissions | null>(null)
const isLoadingPermissions = ref(false)
const permissionsError = ref(false)

const userDisplayName = computed(() => {
  if (!props.user) return ''

  const fullName = [props.user.firstName, props.user.lastName].filter(Boolean).join(' ')
  return fullName || props.user.email
})

const roleOptions = computed(() =>
  (props.user?.roles ?? []).map((role) => ({
    value: role.id,
    label: role.name,
  })),
)

const hasMultipleRoles = computed(() => roleOptions.value.length > 1)

const selectedRoleName = computed(() =>
  props.user?.roles.find((role) => role.id === selectedRoleId.value)?.name ?? '',
)

const productGroups = computed(() =>
  groupPermissionsByProduct(rolePermissions.value?.permissions ?? []),
)

const moduleNavItems = computed<SettingsNavItem[]>(() =>
  productGroups.value.map((product) => ({
    key: product.module,
    label: product.label,
    group: 'Módulos',
    badge: product.permissionCount,
  })),
)

const selectedModule = computed(() =>
  productGroups.value.find((product) => product.module === selectedModuleId.value) ?? null,
)

const modalTitle = computed(() => {
  const name = userDisplayName.value.trim()
  if (!name) return 'Permisos de usuario'
  return `Permisos de usuario - ${name}`
})

const modalDescription = computed(() => {
  const role = selectedRoleName.value.trim() || 'Sin rol asignado'
  const systemSuffix = rolePermissions.value?.isSystem ? ' · Sistema' : ''
  return `Rol: ${role}${systemSuffix}`
})

const clearPermissionsState = () => {
  selectedModuleId.value = ''
  rolePermissions.value = null
  isLoadingPermissions.value = false
  permissionsError.value = false
}

const resetSelection = () => {
  selectedRoleId.value = props.user?.roles[0]?.id ?? ''
}

const syncSelectedModule = () => {
  const groups = productGroups.value

  if (!groups.length) {
    selectedModuleId.value = ''
    return
  }

  const firstModule = groups[0]
  if (!firstModule) {
    selectedModuleId.value = ''
    return
  }

  if (!groups.some((group) => group.module === selectedModuleId.value)) {
    selectedModuleId.value = firstModule.module
  }
}

watch(
  () => [props.modalOpen, props.user?.id] as const,
  ([isOpen]) => {
    if (!isOpen) {
      selectedRoleId.value = ''
      clearPermissionsState()
      return
    }

    resetSelection()
  },
  { immediate: true },
)

watch(
  () => [props.modalOpen, props.companyId, selectedRoleId.value] as const,
  async ([isOpen, companyId, roleId], _, onCleanup) => {
    if (!isOpen || !companyId || !roleId) {
      clearPermissionsState()
      return
    }

    let isCurrent = true
    onCleanup(() => {
      isCurrent = false
    })

    selectedModuleId.value = ''
    isLoadingPermissions.value = true
    permissionsError.value = false
    rolePermissions.value = null

    try {
      const permissions = await companyStore.getCompanyRolePermissions(companyId, roleId)
      if (!isCurrent) return
      rolePermissions.value = permissions
      syncSelectedModule()
    } catch {
      if (!isCurrent) return
      permissionsError.value = true
    } finally {
      if (isCurrent) {
        isLoadingPermissions.value = false
      }
    }
  },
)

const handleClose = () => {
  selectedRoleId.value = ''
  clearPermissionsState()
  emit('close-modal')
}
</script>
