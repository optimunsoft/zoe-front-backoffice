<template>
  <ModalBasic
    id="edit-demonstration-modal"
    :modal-open="modalOpen"
    title="Editar agendamiento"
    description="Modifica los campos y guarda los cambios."
    @close-modal="handleClose"
  >
    <template #icon>
      <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 dark:bg-violet-500/20">
        <svg class="size-5 fill-current text-violet-500" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
        </svg>
      </div>
    </template>

    <p
      v-if="isLoading"
      class="mb-4 text-sm text-gray-500 dark:text-gray-400"
    >
      Cargando agendamiento...
    </p>

    <FormDemonstration
      v-if="modalOpen && demonstrationId"
      :key="demonstrationId"
      ref="formRef"
      mode="edit"
      :class="{ 'pointer-events-none opacity-60': isLoading }"
      @submit="handleEdit"
    />

    <template #footer>
      <Button variant="secondary" :disabled="isSubmitting || isLoading" @click="handleClose">
        Cancelar
      </Button>
      <Button
        variant="primary"
        :loading="isSubmitting"
        :disabled="isLoading"
        @click="submitForm"
      >
        Guardar
      </Button>
    </template>
  </ModalBasic>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

import { Button } from '~/core/ui/buttons'
import { ModalBasic } from '~/core/ui/modal'
import { normalizeDemonstrationResponse } from '../../schema/demonstrations.schema'
import { useDemonstrationsStore } from '../../store/demonstrations.store'
import type { Demonstration, DemonstrationResponse, UpdateDemonstration } from '../../types/demonstration.types'
import FormDemonstration from '../forms/forms.vue'

const props = defineProps<{
  modalOpen: boolean
  demonstrationId: string | null
}>()

const emit = defineEmits<{
  'close-modal': []
  updated: []
}>()

const demonstrationsStore = useDemonstrationsStore()
const formRef = ref<InstanceType<typeof FormDemonstration> | null>(null)
const isSubmitting = ref(false)
const isLoading = ref(false)

const waitForFormRef = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await nextTick()
    if (formRef.value) return true
  }

  return false
}

const resolveDemonstration = async (id: string): Promise<DemonstrationResponse | null> => {
  const fromList = demonstrationsStore.demonstrations.find(
    (item) => String(item.id) === String(id),
  )
  if (fromList) return fromList

  const response = await demonstrationsStore.getDemonstrationById(id)
  return normalizeDemonstrationResponse(response)
}

const loadDemonstration = async (id: string) => {
  isLoading.value = true

  try {
    const ready = await waitForFormRef()
    if (!ready) return

    const demonstration = await resolveDemonstration(id)
    if (!demonstration) {
      emit('close-modal')
      return
    }

    if (!props.modalOpen || props.demonstrationId !== id) return

    await formRef.value?.setValues(demonstration)
  } catch {
    emit('close-modal')
  } finally {
    isLoading.value = false
  }
}

watch(
  () => [props.modalOpen, props.demonstrationId] as const,
  async ([isOpen, id]) => {
    if (!isOpen || !id) {
      isLoading.value = false
      return
    }

    await nextTick()
    await loadDemonstration(id)
  },
)

const handleClose = () => {
  if (isSubmitting.value) return
  formRef.value?.reset()
  emit('close-modal')
}

const submitForm = () => {
  formRef.value?.submit()
}

const handleEdit = async (payload: Demonstration | UpdateDemonstration) => {
  if (isSubmitting.value || !props.demonstrationId || !('status' in payload)) return

  const demonstrationPayload = payload as UpdateDemonstration

  isSubmitting.value = true

  try {
    await demonstrationsStore.UpdateDemonstration(props.demonstrationId, demonstrationPayload)
    await demonstrationsStore.getDemonstrations({
      amount: demonstrationsStore.amount,
      page: demonstrationsStore.page,
    })
    formRef.value?.reset()
    emit('updated')
    emit('close-modal')
  } finally {
    isSubmitting.value = false
  }
}
</script>
