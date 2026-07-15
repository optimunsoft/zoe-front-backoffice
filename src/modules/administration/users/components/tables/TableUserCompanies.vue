<template>
  <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-950/15 -mt-1">
    <div class="mb-3 flex items-center justify-between gap-3">
      <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
        Empresas asociadas
      </h3>
      <TableBadge color="info">
        {{ companies.length }} empresas
      </TableBadge>
    </div>

    <p
      v-if="companies.length === 0"
      class="text-sm text-gray-500 dark:text-gray-400"
    >
      Este usuario no tiene empresas asociadas.
    </p>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm text-left text-gray-800 dark:text-gray-100">
        <thead class="text-xs uppercase text-gray-500 dark:text-gray-400">
          <tr>
            <th
              v-for="column in userCompanyDetailColumns"
              :key="column.key"
              class="pb-2 font-semibold"
              :class="column.key === 'permissions' ? '' : 'pr-4'"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200/70 dark:divide-gray-700/60">
          <tr
            v-for="company in companies"
            :key="company.id"
          >
            <td class="py-2 pr-4">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-medium text-gray-800 dark:text-gray-100">
                  {{ formatTableText(formatUserCompanyName(company)) }}
                </span>
                <TableBadge
                  v-if="company.isOwner"
                  color="warning"
                  badge-class="shrink-0"
                >
                  {{ formatTableText('Dueño') }}
                </TableBadge>
              </div>
            </td>
            <td class="py-2 pr-4">
              <span
                v-if="company.documentNumber?.trim()"
                class="font-medium tabular-nums text-gray-800 dark:text-gray-100"
              >
                {{ company.documentNumber }}
              </span>
              <TableBadge
                v-else
                color="neutral"
              >
                {{ formatTableText('No Aplica') }}
              </TableBadge>
            </td>
            <td class="py-2 pr-4">
              <span
                v-if="company.email?.trim()"
                class="text-gray-800 dark:text-gray-100"
              >
                {{ formatTableText(company.email) }}
              </span>
              <TableBadge
                v-else
                color="neutral"
              >
                {{ formatTableText('No Aplica') }}
              </TableBadge>
            </td>
            <td class="py-2 pr-4">
              <div
                v-if="company.roles.length > 0"
                class="flex flex-wrap gap-1.5"
              >
                <TableBadge
                  v-for="role in company.roles"
                  :key="role.id || role.name"
                  color="violet"
                  badge-class="shrink-0"
                >
                  {{ formatTableText(role.name) }}
                </TableBadge>
              </div>
              <TableBadge
                v-else
                color="neutral"
              >
                {{ formatTableText('No Aplica') }}
              </TableBadge>
            </td>
            <td class="py-2">
              <Tooltip
                v-if="company.roles.length > 0"
                bg="light"
                position="top"
              >
                <template #trigger>
                  <button
                    type="button"
                    :class="[
                      UI_TABLE_ICON_BUTTON_CLASSES,
                      'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400',
                    ]"
                    aria-label="Ver permisos"
                    @click="handleOpenPermissions(company)"
                  >
                    <span class="sr-only">Ver permisos</span>
                    <UiIcon name="permissions" size="lg" />
                  </button>
                </template>
                <div class="whitespace-nowrap text-xs font-medium">
                  Permisos
                </div>
              </Tooltip>
              <TableBadge
                v-else
                color="neutral"
              >
                {{ formatTableText('No Aplica') }}
              </TableBadge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { userCompany } from '~/core/company/types/company.types'
import { TableBadge } from '~/core/ui/badge'
import { UI_TABLE_ICON_BUTTON_CLASSES } from '~/core/ui/interactive.classes'
import { UiIcon } from '~/core/ui/icons'
import { Tooltip } from '~/core/ui/utooltip'
import {
  formatUserCompanyName,
  getVisibleUserCompanies,
  userCompanyDetailColumns,
} from '~/modules/administration/users/mappers/user-companies.mapper'
import type { User, UserCompany } from '~/modules/administration/users/types/users.types'
import { buildUserCompanyPermissionsPayload } from '~/modules/administration/users/utils/user-permissions.utils'
import { formatTableText } from '~/shared/utils/format'

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  permissions: [payload: { companyId: string, companyName: string, user: userCompany }]
}>()

const companies = computed(() => getVisibleUserCompanies(props.user.companies))

const handleOpenPermissions = (company: UserCompany) => {
  const payload = buildUserCompanyPermissionsPayload(props.user, company)
  emit('permissions', payload)
}
</script>
