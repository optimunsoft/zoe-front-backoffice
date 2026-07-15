<template>
  <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-950/15 -mt-1">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Empresas asociadas
        </h3>
        <TableBadge color="info">
          {{ companies.length }} empresas
        </TableBadge>
      </div>

      <Button
        variant="danger"
        size="sm"
        :disabled="!selectedCompanyIds.length || isUnassigning"
        :loading="isUnassigning"
        @click="requestUnassign"
      >
        Desasignar
      </Button>
    </div>

    <p
      v-if="companies.length === 0"
      class="text-sm text-gray-500 dark:text-gray-400"
    >
      Este usuario no tiene empresas asociadas.
    </p>

    <div v-else class="overflow-x-auto rounded-md border border-gray-200/80 dark:border-gray-700/60">
      <table class="w-full border-collapse text-sm text-left text-gray-800 dark:text-gray-100">
        <thead class="text-xs uppercase text-gray-500 dark:text-gray-400">
          <tr>
            <th class="border border-gray-200 dark:border-gray-700/70 bg-gray-100/70 px-3 py-2 font-semibold dark:bg-gray-900/50">
              Empresa
            </th>
            <th class="border border-gray-200 dark:border-gray-700/70 bg-gray-100/70 px-3 py-2 font-semibold dark:bg-gray-900/50">
              NIT
            </th>
            <th class="border border-gray-200 dark:border-gray-700/70 bg-gray-100/70 px-3 py-2 font-semibold dark:bg-gray-900/50">
              Email
            </th>
            <th class="border border-gray-200 dark:border-gray-700/70 bg-gray-100/70 px-3 py-2 font-semibold w-10 text-right dark:bg-gray-900/50">
              <input
                type="checkbox"
                class="form-checkbox"
                :checked="allSelected"
                :indeterminate.prop="someSelected && !allSelected"
                aria-label="Seleccionar todas las empresas"
                @change="toggleSelectAll"
              >
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="company in companies"
            :key="company.id"
          >
            <td class="border border-gray-200 px-3 py-2 dark:border-gray-700/70">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-medium text-gray-800 dark:text-gray-100">
                  {{ formatTableText(formatUserCompanyName(company)) }}
                </span>
                <TableBadge
                  v-if="company.isOwner"
                  color="warning"
                  badge-class="shrink-0"
                >
                  Dueño
                </TableBadge>
              </div>
            </td>
            <td class="border border-gray-200 px-3 py-2 dark:border-gray-700/70">
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
            <td class="border border-gray-200 px-3 py-2 dark:border-gray-700/70">
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
            <td class="border border-gray-200 px-3 py-2 text-right dark:border-gray-700/70">
              <input
                type="checkbox"
                class="form-checkbox"
                :checked="selectedCompanyIds.includes(company.id)"
                :aria-label="`Seleccionar ${formatUserCompanyName(company)}`"
                @change="toggleCompany(company.id)"
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ModalAction
      id="confirm-unassign-backoffice-companies-modal"
      :modal-open="unassignModalOpen"
      @close-modal="cancelUnassign"
    >
      <div class="text-center">
        <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
          <svg
            class="size-6 fill-current text-red-500"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 10.1l-1.4 1.4L8 9.4l-2.1 2.1-1.4-1.4L6.6 8 4.5 5.9l1.4-1.4L8 6.6l2.1-2.1 1.4 1.4L9.4 8l2.1 2.1z" />
          </svg>
        </div>

        <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
          ¿Desasignar empresas?
        </h3>

        <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Se desasignarán
          <span class="font-medium text-gray-700 dark:text-gray-200">
            {{ pendingUnassignCount }}
          </span>
          {{ pendingUnassignCount === 1 ? 'empresa' : 'empresas' }}
          de este usuario.
        </p>

        <div class="flex justify-center gap-2">
          <Button variant="secondary" :disabled="isUnassigning" @click="cancelUnassign">
            Cancelar
          </Button>
          <Button variant="danger" :loading="isUnassigning" @click="confirmUnassign">
            Desasignar
          </Button>
        </div>
      </div>
    </ModalAction>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useCompanyStore } from '~/core/company/store/company.store'
import { TableBadge } from '~/core/ui/badge'
import { Button } from '~/core/ui/buttons'
import { ModalAction } from '~/core/ui/modal'
import {
  formatUserCompanyName,
  getVisibleUserCompanies,
} from '~/modules/administration/users/mappers/user-companies.mapper'
import type { User } from '~/modules/administration/users/types/users.types'
import { formatTableText } from '~/shared/utils/format'

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  unassigned: []
}>()

const companyStore = useCompanyStore()
const selectedCompanyIds = ref<string[]>([])
const isUnassigning = ref(false)
const unassignModalOpen = ref(false)
const pendingUnassignIds = ref<string[]>([])

const companies = computed(() => getVisibleUserCompanies(props.user.companies))

const pendingUnassignCount = computed(() => pendingUnassignIds.value.length)

const allSelected = computed(() =>
  companies.value.length > 0
  && companies.value.every((company) => selectedCompanyIds.value.includes(company.id)),
)

const someSelected = computed(() =>
  companies.value.some((company) => selectedCompanyIds.value.includes(company.id)),
)

watch(
  () => props.user.id,
  () => {
    selectedCompanyIds.value = []
    unassignModalOpen.value = false
    pendingUnassignIds.value = []
  },
)

const toggleCompany = (companyId: string) => {
  if (selectedCompanyIds.value.includes(companyId)) {
    selectedCompanyIds.value = selectedCompanyIds.value.filter((id) => id !== companyId)
    return
  }

  selectedCompanyIds.value = [...selectedCompanyIds.value, companyId]
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedCompanyIds.value = []
    return
  }

  selectedCompanyIds.value = companies.value.map((company) => company.id)
}

const requestUnassign = () => {
  if (!selectedCompanyIds.value.length || isUnassigning.value) return

  pendingUnassignIds.value = [...selectedCompanyIds.value]
  unassignModalOpen.value = true
}

const cancelUnassign = () => {
  if (isUnassigning.value) return

  unassignModalOpen.value = false
  pendingUnassignIds.value = []
}

const confirmUnassign = async () => {
  if (!pendingUnassignIds.value.length || isUnassigning.value) return

  isUnassigning.value = true

  try {
    const companyIds = [...pendingUnassignIds.value]
    const userId = props.user.id

    await Promise.all(
      companyIds.map((companyId) =>
        companyStore.unassignUsersFromCompany(companyId, userId),
      ),
    )

    selectedCompanyIds.value = []
    unassignModalOpen.value = false
    pendingUnassignIds.value = []
    emit('unassigned')
  } finally {
    isUnassigning.value = false
  }
}
</script>
