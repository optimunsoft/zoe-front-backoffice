<template>
  <SettingsPanelSection
    :title="panelTitle"
    max-height="min(56vh, calc(90dvh - 16rem))"
    class="h-0 min-h-0 flex-1"
  >
    <div
      v-if="loading"
      class="space-y-3"
    >
      <div
        v-for="index in 3"
        :key="index"
        class="animate-pulse rounded-xl border border-gray-200 p-4 dark:border-gray-700/60"
      >
        <div class="mb-3 h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        <div class="space-y-2">
          <div class="h-3 w-full rounded bg-gray-100 dark:bg-gray-800" />
          <div class="h-3 w-2/3 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    </div>

    <div
      v-else-if="error"
      class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
    >
      No se pudieron cargar los permisos. Intenta de nuevo.
    </div>

    <div
      v-else-if="!module"
      class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center dark:border-gray-700/60"
    >
      <div class="mb-3 flex size-11 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <UiIcon
          name="permissions"
          size="md"
          class="text-gray-400 dark:text-gray-500"
        />
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ emptyMessage }}
      </p>
    </div>

    <div
      v-else
      class="space-y-4"
    >

      <article
        v-for="resourceGroup in module.resources"
        :key="resourceGroup.resource"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white text-sm shadow-xs dark:border-gray-700/60 dark:bg-gray-900/20"
      >
        <header class="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-gray-700/60 dark:bg-gray-900/40">
          <div class="min-w-0">
            <h3 class="truncate text-sm font-semibold leading-5 text-gray-800 dark:text-gray-100">
              {{ resourceGroup.label }}
            </h3>
          </div>
          <TableBadge
            color="neutral"
            badge-class="text-sm leading-5"
          >
            {{ resourceGroup.permissionCount }}
          </TableBadge>
        </header>

        <ul class="divide-y divide-gray-100 dark:divide-gray-700/60">
          <li
            v-for="item in resourceGroup.items"
            :key="item.name"
            class="px-4 py-3"
          >
            <div class="text-sm font-medium leading-5 text-gray-800 dark:text-gray-100">
              {{ item.name }}
            </div>
            <p
              v-if="item.description"
              class="mt-0.5 text-sm leading-5 text-gray-500 dark:text-gray-400"
            >
              {{ item.description }}
            </p>
          </li>
        </ul>
      </article>
    </div>
  </SettingsPanelSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { SettingsPanelSection } from '~/core/ui/settings'
import { TableBadge } from '~/core/ui/badge'
import { UiIcon } from '~/core/ui/icons'
import type { PermissionProductGroup } from '../../mappers/company-permissions.mapper'

const props = withDefaults(defineProps<{
  module?: PermissionProductGroup | null
  loading?: boolean
  error?: boolean
  hasModules?: boolean
}>(), {
  module: null,
  loading: false,
  error: false,
  hasModules: false,
})

const panelTitle = computed(() => props.module?.label ?? 'Permisos')

const emptyMessage = computed(() => {
  if (props.hasModules) return 'Selecciona un módulo para ver sus permisos.'
  return 'Este rol no tiene permisos asignados.'
})
</script>
