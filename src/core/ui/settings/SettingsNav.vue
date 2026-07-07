<template>
  <div
    class="flex min-h-0 flex-1 flex-col px-3 py-6 md:space-y-3"
  >
    <div
      v-for="group in navGroups"
      :key="group.title"
    >
      <div
        v-if="group.title"
        class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3"
      >
        {{ group.title }}
      </div>
      <ul class="flex flex-nowrap md:block mr-3 md:mr-0">
        <li
          v-for="item in group.items"
          :key="item.key"
          class="mr-0.5 md:mr-0 md:mb-0.5"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between gap-2 px-2.5 py-2 rounded-lg whitespace-nowrap text-left transition-colors"
            :class="isActive(item.key)
              ? 'bg-linear-to-r from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]'
              : 'hover:bg-gray-100/80 dark:hover:bg-gray-800/50'"
            @click="selectItem(item.key)"
          >
            <span class="flex min-w-0 items-center">
              <UiIcon
                v-if="item.icon"
                :name="item.icon"
                size="sm"
                class="mr-2 shrink-0"
                :class="isActive(item.key)
                  ? 'text-violet-500 dark:text-violet-400'
                  : 'text-gray-400 dark:text-gray-500'"
              />
              <span
                class="truncate text-sm font-medium"
                :class="isActive(item.key)
                  ? 'text-violet-500 dark:text-violet-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'"
              >
                {{ item.label }}
              </span>
            </span>
            <span
              v-if="item.badge !== undefined"
              class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
              :class="isActive(item.key)
                ? 'bg-violet-500/15 text-violet-600 dark:bg-violet-500/25 dark:text-violet-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'"
            >
              {{ item.badge }}
            </span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { UiIcon } from '~/core/ui/icons'
import type { SettingsNavGroup, SettingsNavItem } from './settings.types'

const props = defineProps<{
  items: SettingsNavItem[]
  modelValue: string
  groupTitle?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const navGroups = computed<SettingsNavGroup[]>(() => {
  const grouped = new Map<string, SettingsNavItem[]>()

  for (const item of props.items) {
    const title = item.group ?? props.groupTitle ?? ''
    const current = grouped.get(title) ?? []
    current.push(item)
    grouped.set(title, current)
  }

  return Array.from(grouped.entries()).map(([title, items]) => ({
    title,
    items,
  }))
})

const isActive = (key: string) => props.modelValue === key

const selectItem = (key: string) => {
  if (key === props.modelValue) return
  emit('update:modelValue', key)
}
</script>
