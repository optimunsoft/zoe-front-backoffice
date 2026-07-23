<template>
  <div>
    <div class="px-4 sm:px-6 lg:px-8 pt-12 pb-8 w-full max-w-[96rem] mx-auto">
      <div class="mb-8 flex flex-col gap-6">
        <h1 class="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">
          Opciones especiales
        </h1>

        <p class="text-sm text-gray-500 dark:text-gray-400">
          Aquí puedes gestionar las opciones especiales de la aplicación.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UListCard
          v-for="option in specialOptions"
          :key="option.key"
          :title="option.title"
          :description="option.description"
          :icon="option.icon"
          :badge="option.badge"
          :badge-tone="option.badgeTone"
          clickable
          card-class="origin-center transition-transform duration-300 ease-out hover:scale-[1.02]"
          @click="openOptionModal(option)"
        />
      </div>
    </div>

    <CreateGlobalCompany
      v-if="createCompanyModalMounted"
      :modal-open="createCompanyModalOpen"
      @close-modal="closeCreateCompanyModal"
      @created="handleCompanyCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from 'vue'

import { useCatalogStore } from '~/core/catalog/store/catalog.store'
import { UListCard } from '~/core/ui/cards'
import type { UListCardBadgeTone } from '~/core/ui/cards'
import type { UiIconName } from '~/core/ui/icons'
import { useModal } from '~/core/ui/modal'
import { useModulesStore } from '~/modules/modules/store/modules.store'

const CreateGlobalCompany = defineAsyncComponent(
  () => import('~/modules/especials/components/modals/createGlobal.Company.vue'),
)

type SpecialOptionKey = 'create-company'

type SpecialOption = {
  key: SpecialOptionKey
  title: string
  description: string
  icon: UiIconName
  badge?: string
  badgeTone?: UListCardBadgeTone
}

const {
  modalOpen: createCompanyModalOpen,
  open: openCreateCompanyModal,
  close: closeCreateCompanyModal,
} = useModal()

const catalogStore = useCatalogStore()
const modulesStore = useModulesStore()
const createCompanyModalMounted = ref(false)
const isPreloadingCreateCompany = ref(false)

watch(createCompanyModalOpen, (open) => {
  if (open) createCompanyModalMounted.value = true
})

const specialOptions: SpecialOption[] = [
  {
    key: 'create-company',
    title: 'Registro Avanzado de Empresa',
    description: 'Configura una nueva empresa con todos los datos requeridos desde un único flujo',
    icon: 'company',
    badgeTone: 'info',
  },
]

const preloadCreateCompanyDependencies = async () => {
  await Promise.all([
    catalogStore.preload(),
    modulesStore.getModules({}, false),
  ])
}

const openOptionModal = async (option: SpecialOption) => {
  switch (option.key) {
    case 'create-company': {
      if (isPreloadingCreateCompany.value || createCompanyModalOpen.value) return

      createCompanyModalMounted.value = true
      openCreateCompanyModal()

      // Precarga en segundo plano; el modal ya prepara catálogos al abrirse.
      isPreloadingCreateCompany.value = true
      try {
        await preloadCreateCompanyDependencies()
      } catch {
        // No bloquear la apertura del modal si falla la precarga.
      } finally {
        isPreloadingCreateCompany.value = false
      }
      break
    }
    default:
      break
  }
}

const handleCompanyCreated = () => {
  // La lista de empresas se refresca al entrar a esa pantalla.
}
</script>
