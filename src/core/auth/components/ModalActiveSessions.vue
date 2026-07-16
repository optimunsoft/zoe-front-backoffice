<template>
  <ModalBasic
    id="active-sessions-modal"
    :modal-open="modalOpen"
    title="Sesiones activas"
    description="Estas son las sesiones activas asociadas a tu cuenta."
    size="4xl"
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
        <UiIcon name="history" size="md" class="text-violet-500" />
      </div>
    </template>

    <UTable
      title="Sesiones activas"
      :count="sessionRows.length"
      :columns="activeSessionTableColumns"
      :rows="sessionRows"
      :visible-rows="0"
      body-max-height="20rem"
      empty-text="No hay sesiones activas registradas."
    >
      <template #cell-loginAt="{ row }">
        <span class="font-medium text-gray-800 dark:text-gray-100">
          {{ formatTableText(row.loginAt) }}
        </span>
      </template>

      <template #cell-ip="{ row }">
        <span class="font-medium tabular-nums text-gray-800 dark:text-gray-100">
          {{ formatTableText(row.ip) }}
        </span>
      </template>

      <template
        v-for="columnKey in optionalValueColumns"
        :key="columnKey"
        #[`cell-${columnKey}`]="{ row }"
      >
        <TableBadge
          v-if="row[columnKey] === '-'"
          color="neutral"
        >
          {{ formatTableText('No Aplica') }}
        </TableBadge>
        <span
          v-else
          class="text-gray-800 dark:text-gray-100"
        >
          {{ formatTableText(row[columnKey]) }}
        </span>
      </template>
    </UTable>

    <template #footer>
      <Button variant="primary" @click="handleClose">
        Entendido
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
import { formatTableText } from '~/shared/utils/format'
import {
  activeSessionTableColumns,
  mapActiveSessionsToTableRows,
} from '~/core/auth/mappers/active-sessions.mapper'
import type { SessionUser } from '~/core/auth/types/auth.types'

const optionalValueColumns = [
  'browser',
  'so',
  'country',
  'city',
] as const

const props = defineProps<{
  modalOpen: boolean
  sessions: SessionUser[]
}>()

const emit = defineEmits<{
  'close-modal': []
}>()

const sessionRows = computed(() => mapActiveSessionsToTableRows(props.sessions))

const handleClose = () => {
  emit('close-modal')
}
</script>
