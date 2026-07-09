<template>
  <div :class="[getTabsWrapperClasses(variant), wrapperClass]">
    <div
      v-if="variant === 'underline'"
      class="absolute bottom-0 w-full h-px bg-gray-200 dark:bg-gray-700/60"
      aria-hidden="true"
    />

    <ul
      :class="getTabsListClasses(variant)"
      role="tablist"
      :aria-label="ariaLabel"
    >
      <li
        v-for="item in items"
        :key="item.key"
        :class="getTabsItemClasses(variant)"
        role="presentation"
      >
        <component
          :is="resolveTag(item)"
          :id="`tab-${item.key}`"
          role="tab"
          :href="resolveHref(item)"
          :type="resolveTag(item) === 'button' ? 'button' : undefined"
          :aria-selected="isActive(item.key)"
          :aria-controls="`panel-${item.key}`"
          :tabindex="isActive(item.key) ? 0 : -1"
          :disabled="resolveTag(item) === 'button' ? item.disabled : undefined"
          :aria-disabled="item.disabled || undefined"
          :class="getTabsTriggerClasses(variant, isActive(item.key), Boolean(item.disabled))"
          @click.prevent="selectTab(item)"
        >
          <UiIcon
            v-if="variant === 'icons' && item.icon"
            :name="item.icon"
            size="sm"
            :class="isActive(item.key)
              ? 'mr-2'
              : 'mr-2 text-gray-400 dark:text-gray-500'"
          />
          <span>{{ item.label }}</span>
        </component>
      </li>
    </ul>
  </div>

  <div
    v-if="hasContent"
    class="mt-6"
  >
    <template v-for="item in items" :key="`panel-${item.key}`">
      <div
        v-show="isActive(item.key)"
        :id="`panel-${item.key}`"
        role="tabpanel"
        :aria-labelledby="`tab-${item.key}`"
      >
        <slot
          v-if="$slots[item.key]"
          :name="item.key"
          :item="item"
          :active="isActive(item.key)"
        />
      </div>
    </template>

    <slot
      :active-key="model"
      :active-item="activeItem"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

import { UiIcon } from '~/core/ui/icons'

import type { UiTabItem, UiTabsVariant } from './tabs.types'
import {
  getTabsItemClasses,
  getTabsListClasses,
  getTabsTriggerClasses,
  getTabsWrapperClasses,
} from './tabs.utils'

const props = withDefaults(defineProps<{
  items: UiTabItem[]
  variant?: UiTabsVariant
  ariaLabel?: string
  wrapperClass?: string
}>(), {
  variant: 'simple',
  ariaLabel: 'Tabs',
  wrapperClass: '',
})

const emit = defineEmits<{
  change: [key: string]
}>()

const model = defineModel<string>({ required: true })
const slots = useSlots()

const activeItem = computed(() =>
  props.items.find((item) => item.key === model.value) ?? null,
)

const hasPanelSlot = computed(() =>
  props.items.some((item) => Boolean(slots[item.key])),
)

const hasContent = computed(() =>
  Boolean(slots.default) || hasPanelSlot.value,
)

const isActive = (key: string) => model.value === key

const resolveTag = (item: UiTabItem) => {
  if (item.href) return 'a'
  return 'button'
}

const resolveHref = (item: UiTabItem) => {
  if (item.disabled) return undefined
  return item.href ?? undefined
}

const selectTab = (item: UiTabItem) => {
  if (item.disabled || model.value === item.key) return
  model.value = item.key
  emit('change', item.key)
}
</script>
