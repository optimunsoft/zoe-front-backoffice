<template>
  <div
    class="rounded-lg border border-gray-200 bg-white p-4 text-sm dark:border-gray-700/60 dark:bg-gray-900/30"
    :class="wrapperClass"
  >
    <p class="font-medium text-gray-800 dark:text-gray-100">
      Tu contraseña debe contener:
    </p>

    <ul class="mt-3 space-y-2">
      <li :class="itemClass(requirements.minLength)">
        <RequirementIcon :met="requirements.minLength" />
        <span>Al menos 8 caracteres</span>
      </li>

      <li :class="itemClass(requirements.lowercase)">
        <RequirementIcon :met="requirements.lowercase" />
        <span>Letras minúsculas (a-z)</span>
      </li>

      <li :class="itemClass(requirements.uppercase)">
        <RequirementIcon :met="requirements.uppercase" />
        <span>Letras mayúsculas (A-Z)</span>
      </li>

      <li :class="itemClass(requirements.numbers)">
        <RequirementIcon :met="requirements.numbers" />
        <span>Números (0-9)</span>
      </li>

      <li :class="itemClass(requirements.special)">
        <RequirementIcon :met="requirements.special" />
        <span>Caracteres especiales (p. ej. !@#$%^&amp;*)</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { getPasswordRequirements } from '~/shared/utils/password.utils'
import RequirementIcon from './PasswordRequirementIcon.vue'

const props = withDefaults(defineProps<{
  password?: string
  wrapperClass?: string
}>(), {
  password: '',
  wrapperClass: '',
})

const requirements = computed(() => getPasswordRequirements(props.password))

const itemClass = (met: boolean) => [
  'flex items-center gap-2',
  met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400',
]
</script>
