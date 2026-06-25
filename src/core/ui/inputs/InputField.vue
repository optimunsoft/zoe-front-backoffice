<template>
  <div>
    <div
      v-if="label || $slots.tooltip"
      class="flex items-center justify-between"
      :class="label ? 'mb-1' : ''"
    >
      <label
        v-if="label"
        class="block text-sm font-medium"
        :for="htmlFor"
      >
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      <slot name="tooltip" />
    </div>

    <slot />

    <p
      v-if="error"
      class="text-xs mt-1 text-red-500"
    >
      {{ error }}
    </p>
    <p
      v-else-if="hint"
      class="text-xs mt-1"
      :class="hintClass"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  htmlFor?: string
  required?: boolean
  hint?: string
  error?: string
  hintClass?: string
}>(), {
  hintClass: '',
})
</script>
