<template>
  <div class="relative inline-flex">
    <button
      ref="trigger"
      class="inline-flex justify-center items-center group"
      aria-haspopup="true"
      @click.prevent="dropdownOpen = !dropdownOpen"
      :aria-expanded="dropdownOpen"
    >
      <span
        class="w-8 h-8 shrink-0 rounded-full bg-gray-200 dark:bg-gray-600"
        aria-hidden="true"
      />
      <div class="flex items-center truncate">
        <span class="truncate ml-2 text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">{{ authStore.user?.firstName + ' ' + authStore.user?.lastName }}</span>
        <svg class="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
          <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
        </svg>
      </div>
    </button>
    <transition
      enter-active-class="transition ease-out duration-200 transform"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-out duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-show="dropdownOpen" class="origin-top-right z-10 absolute top-full min-w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1" :class="align === 'right' ? 'right-0' : 'left-0'">
        <div class="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
          <div class="font-medium text-gray-800 dark:text-gray-100">{{ authStore.user?.firstName + ' ' + authStore.user?.lastName }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400 italic">{{ authStore.user?.email }}</div>
        </div>
        <ul
          ref="dropdown"
          @focusin="dropdownOpen = true"
          @focusout="dropdownOpen = false"
        >
          <!-- <li>
            <router-link class="font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-1 px-3" to="/settings/account" @click="dropdownOpen = false">Configuración</router-link>
          </li> -->
          <li>
            <button
              type="button"
              class="w-full text-left font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-1 px-3"
              @click.prevent="submitLogout"
            >
              Salir
            </button>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import { useAuthStore } from '~/core/auth/store/auth.store'

defineProps<{
  align?: string
}>()

const authStore = useAuthStore()

const dropdownOpen = ref(false)
const trigger = ref<HTMLElement | null>(null)
const dropdown = ref<HTMLElement | null>(null)

const clickHandler = ({ target }: MouseEvent) => {
  if (!dropdownOpen.value || !dropdown.value || !trigger.value) return
  if (dropdown.value.contains(target as Node) || trigger.value.contains(target as Node)) return
  dropdownOpen.value = false
}

const keyHandler = ({ keyCode }: KeyboardEvent) => {
  if (!dropdownOpen.value || keyCode !== 27) return
  dropdownOpen.value = false
}

const submitLogout = async () => {
  dropdownOpen.value = false
  await authStore.logout()
  await navigateTo('/')
}

onMounted(() => {
  document.addEventListener('click', clickHandler)
  document.addEventListener('keydown', keyHandler)
})

onUnmounted(() => {
  document.removeEventListener('click', clickHandler)
  document.removeEventListener('keydown', keyHandler)
})
</script>
