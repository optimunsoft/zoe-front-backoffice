<template>
  <ModalShell
    :id="id"
    :modal-open="modalOpen"
    position="top"
    size="2xl"
    @close-modal="emit('close-modal')"
  >
    <form class="border-b border-gray-100 dark:border-gray-700/60" @submit.prevent="handleSubmit">
      <div class="relative">
        <label :for="searchId" class="sr-only">Buscar módulos</label>
        <input
          :id="searchId"
          ref="searchInput"
          v-model="searchQuery"
          class="w-full dark:text-gray-300 bg-white dark:bg-gray-800 border-0 focus:ring-transparent placeholder-gray-400 dark:placeholder-gray-500 appearance-none py-3 pl-10 pr-4"
          type="search"
          placeholder="Buscar módulos..."
          autocomplete="off"
        />
        <button class="absolute inset-0 right-auto group pointer-events-none" type="submit" aria-label="Buscar">
          <svg class="shrink-0 fill-current text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 ml-4 mr-2" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
            <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
          </svg>
        </button>
      </div>
    </form>

    <div class="py-4 px-2 max-h-80 overflow-y-auto">
      <p
        v-if="groupedResults.length === 0"
        class="px-2 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        No se encontraron módulos para «{{ searchQuery.trim() }}».
      </p>

      <div
        v-for="group in groupedResults"
        :key="group.title"
        class="mb-3 last:mb-0"
      >
        <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-2 mb-2">
          {{ group.title }}
        </div>
        <ul class="text-sm">
          <li v-for="item in group.items" :key="item.key">
            <router-link
              class="flex items-center p-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/20 rounded-lg"
              :to="item.to"
              @click="handleSelect"
            >
              <svg
                class="fill-current text-gray-400 dark:text-gray-500 shrink-0 mr-3"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path v-for="path in item.iconPaths || defaultSidebarIcon" :key="path" :d="path" />
              </svg>
              <span>
                <span class="font-medium">{{ item.label }}</span>
                <span
                  v-if="item.group"
                  class="text-gray-600 dark:text-gray-400"
                > — {{ item.group }}</span>
              </span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </ModalShell>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { defaultSidebarIcon } from '~/core/layout/sidebar/icons'
import { sidebarMenuSections } from '~/core/layout/sidebar/sidebar-menu'
import {
  filterSidebarMenuSearch,
  flattenSidebarMenuForSearch,
  groupSidebarMenuSearchItems,
} from '~/core/layout/sidebar/sidebar-menu-search'

import ModalShell from './ModalShell.vue'

const props = defineProps<{
  id: string
  searchId: string
  modalOpen: boolean
}>()

const emit = defineEmits<{
  'open-modal': []
  'close-modal': []
}>()

const route = useRoute()
const router = useRouter()
const searchInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')

const menuItems = computed(() =>
  flattenSidebarMenuForSearch(sidebarMenuSections, { route: route }),
)

const filteredItems = computed(() =>
  filterSidebarMenuSearch(menuItems.value, searchQuery.value),
)

const groupedResults = computed(() =>
  groupSidebarMenuSearchItems(filteredItems.value),
)

const handleSelect = () => {
  emit('close-modal')
}

const handleSubmit = () => {
  const firstMatch = filteredItems.value[0]
  if (!firstMatch) return

  router.push(firstMatch.to)
  emit('close-modal')
}

watch(() => props.modalOpen, (open) => {
  if (open) {
    nextTick(() => searchInput.value?.focus())
    return
  }

  searchQuery.value = ''
})
</script>
