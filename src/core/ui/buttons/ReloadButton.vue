<template>
  <Tooltip bg="light" position="top">
    <template #trigger>
      <Button
        variant="secondary"
        icon-only
        :loading="loading"
        :disabled="disabled"
        aria-label="Recargar"
        @click="emit('click', $event)"
      >
        <template #icon>
          <UIcon name="i-lucide-refresh-cw" class="size-4" />
        </template>
      </Button>
    </template>
    <div class="whitespace-nowrap text-xs font-medium">
      Limpiar filtros y recargar
    </div>
  </Tooltip>
</template>

<script setup lang="ts">
import Button from './Button.vue'
import { Tooltip } from '~/core/ui/Utooltip'

withDefaults(defineProps<{
  loading?: boolean
  disabled?: boolean
}>(), {
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>
