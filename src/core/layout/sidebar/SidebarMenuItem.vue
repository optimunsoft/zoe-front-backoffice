<template>
  <SidebarLinkGroup v-if="hasChildren" v-slot="parentLink" :activeCondition="activeCondition">
    <a
      class="block text-gray-800 dark:text-gray-100 truncate transition"
      :class="!activeCondition && 'hover:text-gray-900 dark:hover:text-white'"
      href="#0"
      @click.prevent="parentLink.handleClick(); expandSidebar()"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <UiIcon
            :name="itemIcon"
            size="sm"
            :class="activeCondition ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500'"
          />
          <span class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">{{ item.label }}</span>
        </div>
        <div class="flex shrink-0 ml-2">
          <svg
            class="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500"
            :class="parentLink.expanded && 'rotate-180'"
            viewBox="0 0 12 12"
          >
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </div>
    </a>
    <div class="lg:hidden lg:sidebar-expanded:block 2xl:block">
      <ul class="pl-8 mt-1" :class="!parentLink.expanded && 'hidden'">
        <SidebarMenuItem
          v-for="child in item.children"
          :key="child.key || child.label"
          :item="child"
          :level="level + 1"
          @expand-sidebar="expandSidebar"
        />
      </ul>
    </div>
  </SidebarLinkGroup>

  <router-link v-else :to="resolveTo(item)" custom v-slot="{ href, navigate, isExactActive }">
    <li
      :class="[
        level === 0 ? 'pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0' : 'mb-1 last:mb-0',
        level === 0 && isExactActive && 'bg-linear-to-r from-brand-500/12 dark:from-brand-500/24 to-brand-500/4',
      ]"
    >
      <a
        class="block transition truncate"
        :class="level === 0
          ? (isExactActive ? 'text-gray-800 dark:text-gray-100' : 'text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white')
          : (isExactActive ? 'text-brand-500' : 'text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200')"
        :href="href"
        @click="navigate"
      >
        <div v-if="level === 0" class="flex items-center">
          <UiIcon
            :name="itemIcon"
            size="sm"
            :class="isExactActive ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500'"
          />
          <span class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">{{ item.label }}</span>
        </div>
        <span v-else class="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">{{ item.label }}</span>
      </a>
    </li>
  </router-link>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import SidebarLinkGroup from './SidebarLinkGroup.vue'
import { UiIcon, defaultSidebarIcon } from '~/core/ui/icons'

export default {
  name: 'SidebarMenuItem',
  components: {
    SidebarLinkGroup,
    UiIcon,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    level: {
      type: Number,
      default: 0,
    },
  },
  emits: ['expand-sidebar'],
  setup(props, { emit }) {
    const route = useRoute()

    const hasChildren = computed(() => Array.isArray(props.item.children) && props.item.children.length > 0)
    const itemIcon = computed(() => props.item.icon || defaultSidebarIcon)

    const resolveValue = (value) => {
      if (typeof value === 'function') return value({ route })
      return value
    }

    const resolveTo = (item) => resolveValue(item.to)

    const isItemActive = (item) => {
      if (typeof item.active === 'function') return item.active({ route })
      if (typeof item.active === 'boolean') return item.active
      if (Array.isArray(item.children)) return item.children.some(isItemActive)

      const to = resolveTo(item)
      return Boolean(to) && route.path === to
    }

    const activeCondition = computed(() => isItemActive(props.item))

    const expandSidebar = () => {
      emit('expand-sidebar')
    }

    return {
      activeCondition,
      expandSidebar,
      hasChildren,
      itemIcon,
      resolveTo,
    }
  },
}
</script>
