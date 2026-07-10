<template>
  <ModalBasic
    id="user-sessions-modal"
    :modal-open="modalOpen"
    :title="modalTitle"
    :description="modalDescription"
    size="5xl"
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
        <UiIcon name="history" size="md" class="text-violet-500" />
      </div>
    </template>

    <UTable
      v-if="user"
      title="Historial de sesiones"
      :count="sessionRows.length"
      :columns="userSessionTableColumns"
      :rows="sessionRows"
      empty-text="Este usuario no tiene sesiones registradas."
    >
      <template #cell-loginAt="{ row }">
        <span class="font-medium text-gray-800 dark:text-gray-100">
          {{ row.loginAt }}
        </span>
      </template>

      <template #cell-ip="{ row }">
        <span class="font-medium tabular-nums text-gray-800 dark:text-gray-100">
          {{ row.ip }}
        </span>
      </template>

      <template #cell-logoutAt="{ row }">
        <TableBadge
          v-if="row.logoutAtBadge"
          :color="row.logoutAtBadge"
        >
          {{ row.logoutAt }}
        </TableBadge>
        <span
          v-else
          class="text-gray-600 dark:text-gray-300"
        >
          {{ row.logoutAt }}
        </span>
      </template>

      <template
        v-for="columnKey in sessionEmptyValueColumns"
        :key="columnKey"
        #[`cell-${columnKey}`]="{ row }"
      >
        <TableBadge
          v-if="row[columnKey] === '-'"
          color="neutral"
        >
          No Aplica
        </TableBadge>
        <span
          v-else
          class="text-gray-600 dark:text-gray-300"
        >
          {{ row[columnKey] }}
        </span>
      </template>
    </UTable>

    <template #footer>
      <Button variant="secondary" @click="handleClose">
        Cerrar
      </Button>
    </template>
  </ModalBasic>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { Button } from '~/core/ui/buttons'
import { TableBadge } from '~/core/ui/badge'
import { UiIcon } from '~/core/ui/icons'
import { ModalBasic } from '~/core/ui/modal'
import UTable from '~/core/ui/Tables/Utable.vue'
import {
  mapUserSessionsToTableRows,
  userSessionTableColumns,
} from '~/modules/administration/users/mappers/user-sessions.mapper'
import type { User } from '~/modules/administration/users/types/users.types'

const sessionEmptyValueColumns = [
  'device',
  'browser',
  'operatingSystem',
  'location',
] as const

const props = defineProps<{
  modalOpen: boolean
  user: User | null
}>()

const emit = defineEmits<{
  'close-modal': []
}>()

const sessionRows = computed(() => mapUserSessionsToTableRows(props.user?.sessions))

const userDisplayName = computed(() => {
  if (!props.user) return ''

  const fullName = [props.user.firstName, props.user.lastName].filter(Boolean).join(' ')
  return fullName || props.user.email
})

const modalTitle = computed(() => {
  const name = userDisplayName.value.trim()
  if (!name) return 'Sesiones de usuario'
  return `Sesiones de usuario - ${name}`
})

const modalDescription = computed(() => {
  const email = props.user?.email?.trim()
  if (!email) return 'Consulta el historial de accesos del usuario.'
  return email
})

const handleClose = () => {
  emit('close-modal')
}
</script>
