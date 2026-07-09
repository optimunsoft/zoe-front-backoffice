<template>
  <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-950/15 -mt-1">
    <div class="mb-3 flex items-center justify-between gap-3">
      <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
        Usuarios Disponibles
      </h3>
      <TableBadge color="info">
        {{ users.length }} usuarios
      </TableBadge>
    </div>

    <p
      v-if="users.length === 0"
      class="text-sm text-gray-500 dark:text-gray-400"
    >
      Esta empresa no tiene usuarios registrados.
    </p>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm text-left">
        <thead class="text-xs uppercase text-gray-500 dark:text-gray-400">
          <tr>
            <th
              v-for="column in companyUserDetailColumns"
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
            v-for="user in users"
            :key="user.id"
          >
            <td class="py-2 pr-4">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-medium text-gray-800 dark:text-gray-100">
                  {{ formatCompanyUserName(user) }}
                </span>
                <TableBadge
                  v-if="user.isOwner"
                  color="warning"
                  badge-class="shrink-0"
                >
                  Dueño
                </TableBadge>
              </div>
            </td>
            <td class="py-2 pr-4">
              <span
                v-if="user.email?.trim()"
                class="text-gray-600 dark:text-gray-300"
              >
                {{ user.email }}
              </span>
              <TableBadge
                v-else
                color="neutral"
              >
                No Aplica
              </TableBadge>
            </td>
            <td class="py-2 pr-4">
              <TableBadge
                v-if="formatCompanyUserType(user.userType)"
                color="neutral"
              >
                {{ formatCompanyUserType(user.userType) }}
              </TableBadge>
              <TableBadge
                v-else
                color="neutral"
              >
                No Aplica
              </TableBadge>
            </td>
            <td class="py-2 pr-4">
              <TableBadge :color="user.isActive ? 'success' : 'neutral'">
                {{ user.isActive ? 'Activo' : 'Inactivo' }}
              </TableBadge>
            </td>
            <td class="py-2 pr-4">
              <div
                v-if="user.roles.length > 0"
                class="flex flex-wrap gap-1.5"
              >
                <TableBadge
                  v-for="role in user.roles"
                  :key="role.id || role.name"
                  color="violet"
                  badge-class="shrink-0"
                >
                  {{ formatRoleName(role.name) }}
                </TableBadge>
              </div>
              <TableBadge
                v-else
                color="neutral"
              >
                No Aplica
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

import {
  companyUserDetailColumns,
  formatCompanyUserName,
  formatCompanyUserType,
  getVisibleCompanyUsers,
} from '~/core/company/mappers/company-users.mapper'
import type { Company, userCompany } from '~/core/company/types/company.types'
import { useCompanyStore } from '~/core/company/store/company.store'

import { TableBadge } from '~/core/ui/badge'
import { toTitleCase } from '~/shared/utils/format'

const props = defineProps<{
  companyId: string
  companyName: string
}>()

const emit = defineEmits<{
  permissions: [payload: { companyId: string, user: userCompany }]
}>()

const companyStore = useCompanyStore()

const users = computed(() => {
  const company = companyStore.getCompanyFromList(props.companyId)
  return getVisibleCompanyUsers(company?.users as Company['users'] | undefined)
})

const formatRoleName = (value: string) => {
  if (!value.trim()) return '-'
  return toTitleCase(value)
}


</script>
