<template>
  <div class="space-y-8">
    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">
        Simple
      </h2>
      <UTabs
        v-model="simpleTab"
        variant="simple"
        :items="tabItems"
      />
    </section>

    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">
        With Underline
      </h2>
      <UTabs
        v-model="underlineTab"
        variant="underline"
        :items="tabItems"
      />
    </section>

    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">
        With Icons
      </h2>
      <UTabs
        v-model="iconsTab"
        variant="icons"
        :items="iconTabItems"
      />
    </section>

    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">
        With Container
      </h2>
      <UTabs
        v-model="containerTab"
        variant="container"
        :items="tabItems"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import UTabs from './UTabs.vue'
import type { UiTabItem } from './tabs.types'

defineOptions({
  name: 'TabsPage',
})

const tabItems: UiTabItem[] = [
  { key: 'account', label: 'Account' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'integrations', label: 'Integrations' },
  { key: 'plans', label: 'Plans' },
  { key: 'billing', label: 'Billing' },
]

const iconTabItems: UiTabItem[] = [
  { key: 'account', label: 'Account', icon: 'userCircle' },
  { key: 'notifications', label: 'Notifications', icon: 'messages' },
  { key: 'integrations', label: 'Integrations', icon: 'administration' },
  { key: 'plans', label: 'Plans', icon: 'scheduling' },
  { key: 'billing', label: 'Billing', icon: 'finance' },
]

const simpleTab = ref('account')
const underlineTab = ref('account')
const iconsTab = ref('account')
const containerTab = ref('account')
</script>
