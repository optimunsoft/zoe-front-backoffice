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

    <div v-else class="overflow-x-auto rounded-md border border-gray-200/80 dark:border-gray-700/60">
      <table class="w-full border-collapse text-sm text-left text-gray-800 dark:text-gray-100">
        <thead class="text-xs uppercase text-gray-500 dark:text-gray-400">
          <tr>
            <th
              v-for="column in companyUserDetailColumns"
              :key="column.key"
              class="border border-gray-200 bg-gray-100/70 px-3 py-2 font-semibold dark:border-gray-700/70 dark:bg-gray-900/50"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
          >
            <td class="border border-gray-200 px-3 py-2 dark:border-gray-700/70">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-medium text-gray-800 dark:text-gray-100">
                  {{ formatTableText(formatCompanyUserName(user)) }}
                </span>
                <TableBadge
                  v-if="user.isOwner"
                  color="warning"
                  badge-class="shrink-0"
                >
                  {{ formatTableText('Dueño') }}
                </TableBadge>
              </div>
            </td>
            <td class="border border-gray-200 px-3 py-2 dark:border-gray-700/70">
              <span
                v-if="user.email?.trim()"
                class="text-gray-800 dark:text-gray-100"
              >
                {{ formatTableText(user.email) }}
              </span>
              <TableBadge
                v-else
                color="neutral"
              >
                {{ formatTableText('No Aplica') }}
              </TableBadge>
            </td>
            <td class="border border-gray-200 px-3 py-2 dark:border-gray-700/70">
              <TableBadge
                v-if="formatCompanyUserType(user.userType)"
                color="neutral"
              >
                {{ formatTableText(formatCompanyUserType(user.userType)) }}
              </TableBadge>
              <TableBadge
                v-else
                color="neutral"
              >
                {{ formatTableText('No Aplica') }}
              </TableBadge>
            </td>
            <td class="border border-gray-200 px-3 py-2 dark:border-gray-700/70">
              <TableBadge :color="user.isActive ? 'success' : 'neutral'">
                {{ formatTableText(user.isActive ? 'Activo' : 'Inactivo') }}
              </TableBadge>
            </td>
            <td class="border border-gray-200 px-3 py-2 dark:border-gray-700/70">
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
import { formatTableText } from '~/shared/utils/format'

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

</script>
