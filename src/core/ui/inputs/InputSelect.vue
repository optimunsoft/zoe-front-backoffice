<template>
  <InputField
    :label="label"
    :html-for="selectId"
    :required="required"
    :hint="hint"
    :error="error"
  >
    <div
      v-if="compactSelected"
      ref="anchorRef"
      class="relative"
    >
      <button
        :id="selectId"
        type="button"
        class="form-select w-full truncate text-left"
        :class="[
          selectClass,
          disabled ? 'cursor-not-allowed opacity-60' : '',
          !selectedDisplayLabel && placeholder ? 'text-gray-400 dark:text-gray-500' : '',
        ]"
        :disabled="disabled"
        :aria-expanded="dropdownOpen"
        aria-haspopup="listbox"
        @click="toggleDropdown"
      >
        {{ selectedDisplayLabel || placeholder }}
      </button>

      <input
        v-if="name"
        type="hidden"
        :name="name"
        :value="modelValue"
      >

      <Teleport v-if="teleportDropdown" to="body">
        <transition
          enter-active-class="transition ease-out duration-100 transform"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-out duration-75"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-show="dropdownOpen && teleportPanelStyle"
            ref="dropdownPanelRef"
            class="fixed max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700/60 dark:bg-gray-800"
            :style="teleportPanelStyle"
          >
            <button
              v-for="option in options"
              :key="String(option.value)"
              type="button"
              role="option"
              class="flex w-full items-center px-3 py-2 text-left text-sm text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-100 dark:hover:bg-gray-700/20"
              :class="option.value === modelValue ? 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' : ''"
              :disabled="option.disabled"
              @click="selectOption(option)"
            >
              {{ option.label }}
            </button>
          </div>
        </transition>
      </Teleport>

      <transition
        v-else
        enter-active-class="transition ease-out duration-100 transform"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-out duration-75"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-show="dropdownOpen"
          class="absolute left-0 top-full z-50 mt-1 max-h-56 min-w-full w-max overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700/60 dark:bg-gray-800"
        >
          <button
            v-for="option in options"
            :key="String(option.value)"
            type="button"
            role="option"
            class="flex w-full items-center px-3 py-2 text-left text-sm text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-100 dark:hover:bg-gray-700/20"
            :class="option.value === modelValue ? 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' : ''"
            :disabled="option.disabled"
            @click="selectOption(option)"
          >
            {{ option.label }}
          </button>
        </div>
      </transition>
    </div>

    <select
      v-else
      :id="selectId"
      :value="modelValue"
      :name="name"
      :required="required"
      :disabled="disabled"
      class="form-select w-full"
      :class="selectClass"
      @change="onChange"
    >
      <option v-if="placeholder" disabled value="">
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="String(option.value)"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
      <slot />
    </select>
  </InputField>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useId } from 'vue'

import { useAnchoredOverlay } from '~/core/company/composables/use-anchored-overlay'
import InputField from './InputField.vue'
import type { InputSelectOption } from './input.types'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  id?: string
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  hint?: string
  error?: string
  options?: InputSelectOption[]
  selectClass?: string
  compactSelected?: boolean
  teleportDropdown?: boolean
}>(), {
  modelValue: '',
  options: () => [],
  selectClass: '',
  compactSelected: false,
  teleportDropdown: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const generatedId = useId()
const selectId = computed(() => props.id ?? generatedId)

const dropdownOpen = ref(false)
const dropdownPanelRef = ref<HTMLElement | null>(null)

const { anchorRef, panelStyle, updatePosition } = useAnchoredOverlay(dropdownOpen, {
  zIndex: 100,
})

const teleportPanelStyle = computed(() => {
  if (!panelStyle.value) return undefined

  return {
    ...panelStyle.value,
    minWidth: panelStyle.value.width,
    width: 'max-content',
  }
})

const selectedOption = computed(() =>
  props.options.find((option) => String(option.value) === String(props.modelValue ?? '')),
)

const selectedDisplayLabel = computed(() => {
  const option = selectedOption.value
  if (!option) return ''

  return option.selectedLabel ?? option.label
})

const onChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}

const toggleDropdown = async () => {
  if (props.disabled) return

  dropdownOpen.value = !dropdownOpen.value

  if (props.teleportDropdown && dropdownOpen.value) {
    await nextTick()
    updatePosition()
  }
}

const selectOption = (option: InputSelectOption) => {
  if (option.disabled) return

  emit('update:modelValue', option.value)
  dropdownOpen.value = false
}

const clickHandler = ({ target }: MouseEvent) => {
  if (!dropdownOpen.value || !target || !(target instanceof Node)) return
  if (anchorRef.value?.contains(target)) return
  if (dropdownPanelRef.value?.contains(target)) return

  dropdownOpen.value = false
}

const keyHandler = ({ key }: KeyboardEvent) => {
  if (!dropdownOpen.value || key !== 'Escape') return

  dropdownOpen.value = false
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
