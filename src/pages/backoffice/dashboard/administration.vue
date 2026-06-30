<template>
  <div class="px-4 sm:px-6 lg:px-8 pt-12 pb-8 w-full max-w-[96rem] mx-auto">
    <div class="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
        Administración
      </h1>

      <div class="flex w-full justify-end sm:w-auto">
        <div class="w-full sm:w-64">
          <InputSearch
            v-model="searchQuery"
            placeholder="Buscar..."
            search-label="Buscar"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import InputSearch from '~/core/ui/inputs/InputSearch.vue'

const searchQuery = ref('')
</script>