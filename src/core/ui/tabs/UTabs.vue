<template>
  <div :class="[getTabsWrapperClasses(variant), wrapperClass]">
    <div
      v-if="variant === 'underline' || variant === 'folder'"
      class="absolute bottom-0 w-full h-px bg-gray-200 dark:bg-gray-700/60"
      aria-hidden="true"
    />

    <ul
      :class="getTabsListClasses(variant)"
      role="tablist"
      :aria-label="ariaLabel"
    >
      <li
        v-for="(item, index) in items"
        :key="item.key"
        :class="getTabsItemClasses(variant)"
        :style="variant === 'folder'
          ? getFolderItemStyle(isActive(item.key), index, items.length)
          : undefined"
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
          :class="getTabsTriggerClasses(variant, isActive(item.key), Boolean(item.disabled), index)"
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
        v-if="keepAlivePanels || isActive(item.key)"
        v-show="!keepAlivePanels || isActive(item.key)"
        :id="`panel-${item.key}`"
        role="tabpanel"
        :aria-labelledby="`tab-${item.key}`"
      >
        <slot
          v-if="$slots[item.key]"
          :name="item.key"
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
  getFolderItemStyle,
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
  /** When false, inactive panels unmount (v-if). Default keeps current v-show behavior. */
  keepAlivePanels?: boolean
}>(), {
  variant: 'simple',
  ariaLabel: 'Tabs',
  wrapperClass: '',
  keepAlivePanels: true,
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

defineSlots<{
  default?: (props: {
    activeKey: string
    activeItem: UiTabItem | null
  }) => unknown
}>()
</script>

<style scoped>
.folder-tabs-wrapper {
  --folder-inactive-bg: #f3f4f6; /* gray-100 */
  --folder-hover-bg: var(--color-brand-50);
  --folder-active-bg: var(--color-brand-500);
  --folder-radius: 14px;
  --folder-flare: 12px;
  --folder-text: #6b7280; /* gray-500 */
  --folder-text-hover: #4b5563; /* gray-600 */
  --folder-active-text: #ffffff;
}

:global(.dark) .folder-tabs-wrapper {
  --folder-inactive-bg: #1f2937; /* gray-800 */
  --folder-hover-bg: rgb(0 123 255 / 0.14);
  --folder-active-bg: var(--color-brand-500);
  --folder-text: #9ca3af; /* gray-400 */
  --folder-text-hover: #d1d5db; /* gray-300 */
  --folder-active-text: #ffffff;
}

.folder-tab {
  --folder-tab-bg: var(--folder-inactive-bg);
  position: relative;
  display: inline-block;
  padding: 0.65rem 1.35rem;
  border: 0;
  border-radius: var(--folder-radius) var(--folder-radius) 0 0;
  background: var(--folder-tab-bg);
  color: var(--folder-text);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 150ms ease,
    background-color 150ms ease,
    box-shadow 150ms ease;
}

.folder-tab:hover:not(.is-active):not(.is-disabled) {
  --folder-tab-bg: var(--folder-hover-bg);
  color: var(--folder-text-hover);
}

.folder-tab.is-active {
  --folder-tab-bg: var(--folder-active-bg);
  z-index: 2;
  margin-bottom: -1px;
  color: var(--folder-active-text);
  font-weight: 600;
  box-shadow:
    0 1px 2px rgb(15 23 42 / 0.06),
    0 4px 12px -2px rgb(0 123 255 / 0.28);
}

:global(.dark) .folder-tab.is-active {
  color: var(--folder-active-text);
  box-shadow:
    0 1px 2px rgb(0 0 0 / 0.25),
    0 4px 12px -2px rgb(0 123 255 / 0.35);
}

.folder-tab.is-disabled,
.folder-tab:disabled {
  --folder-tab-bg: #f3f4f6;
  --folder-text: #9ca3af;
  color: #9ca3af;
  cursor: not-allowed;
  pointer-events: none;
  box-shadow: none;
}

.folder-tab.is-disabled span,
.folder-tab:disabled span {
  color: inherit;
}

:global(.dark) .folder-tab.is-disabled,
:global(.dark) .folder-tab:disabled {
  --folder-tab-bg: rgb(31 41 55 / 0.6);
  --folder-text: #6b7280;
  color: #6b7280;
}

/* Curvas cóncavas laterales (efecto carpeta) */
.folder-tab::before,
.folder-tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  width: var(--folder-flare);
  height: var(--folder-flare);
  background: transparent;
  pointer-events: none;
  transition: box-shadow 150ms ease;
}

.folder-tab::before {
  left: calc(var(--folder-flare) * -1);
  border-bottom-right-radius: var(--folder-flare);
  box-shadow: 6px 0 0 0 var(--folder-tab-bg);
}

.folder-tab::after {
  right: calc(var(--folder-flare) * -1);
  border-bottom-left-radius: var(--folder-flare);
  box-shadow: -6px 0 0 0 var(--folder-tab-bg);
}

.folder-tab:focus-visible {
  outline: 2px solid rgb(0 123 255 / 0.35);
  outline-offset: 2px;
}
</style>
