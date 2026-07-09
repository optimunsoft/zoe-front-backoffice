<template>
  <component
    :is="rootTag"
    :to="to"
    :href="href"
    :type="isButton ? nativeType : undefined"
    :disabled="isButton ? isDisabled : undefined"
    :aria-disabled="!isButton && isDisabled ? true : undefined"
    :aria-label="ariaLabel"
    :class="buttonClasses"
    @click="onClick"
  >
    <template v-if="loading">
      <svg
        class="animate-spin fill-current shrink-0"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path d="M8 16a7.928 7.928 0 01-3.428-.77l.857-1.807A6.006 6.006 0 0014 8c0-3.309-2.691-6-6-6a6.006 6.006 0 00-5.422 8.572l-1.806.859A7.929 7.929 0 010 8c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
      </svg>
      <span v-if="hasLabel && !iconOnly" class="ml-2">
        <slot />
      </span>
    </template>

    <template v-else-if="iconOnly">
      <span :class="iconClasses">
        <slot name="icon">
          <slot />
        </slot>
      </span>
    </template>

    <template v-else>
      <span
        v-if="hasIcon && iconPosition === 'left'"
        :class="[iconClasses, hasLabel ? 'mr-2' : '']"
      >
        <slot name="icon" />
      </span>

      <span v-if="hasLabel">
        <slot />
      </span>

      <span
        v-if="hasIcon && iconPosition === 'right'"
        :class="[iconClasses, hasLabel ? 'ml-2' : '']"
      >
        <slot name="icon" />
      </span>
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed, inject, useSlots } from 'vue'

import {
  BUTTON_DISABLED_CLASSES,
  BUTTON_GROUP_ACTIVE_CLASSES,
  BUTTON_GROUP_INACTIVE_CLASSES,
  BUTTON_GROUP_ITEM_CLASSES,
  BUTTON_INTERACTION_CLASSES,
  getButtonIconClasses,
  getButtonSizeClass,
  getButtonVariantClasses,
  resolveButtonVariant,
} from './button.utils'
import type {
  ButtonAppearance,
  ButtonColor,
  ButtonIconPosition,
  ButtonNativeType,
  ButtonSize,
  ButtonVariant,
} from './button.types'

const props = withDefaults(defineProps<{
  variant?: ButtonVariant
  color?: ButtonColor
  appearance?: ButtonAppearance
  size?: ButtonSize
  nativeType?: ButtonNativeType
  to?: string | object
  href?: string
  disabled?: boolean
  loading?: boolean
  block?: boolean
  iconOnly?: boolean
  iconPosition?: ButtonIconPosition
  active?: boolean
  grouped?: boolean
  ariaLabel?: string
  buttonClass?: string
}>(), {
  color: 'primary',
  appearance: 'solid',
  size: 'md',
  nativeType: 'button',
  disabled: false,
  loading: false,
  block: false,
  iconOnly: false,
  iconPosition: 'left',
  active: false,
  grouped: false,
  buttonClass: '',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const slots = useSlots()
const inButtonGroup = inject<boolean>('uiButtonGroup', false)

const resolvedVariant = computed(() =>
  resolveButtonVariant(props.variant, props.color, props.appearance),
)

const isGrouped = computed(() => props.grouped || inButtonGroup)
const isDisabled = computed(() => props.disabled || props.loading)
const isButton = computed(() => !props.to && !props.href)

const rootTag = computed(() => {
  if (props.to) return 'NuxtLink'
  if (props.href) return 'a'
  return 'button'
})

const hasIcon = computed(() => Boolean(slots.icon))
const hasLabel = computed(() => Boolean(slots.default))

const iconClasses = computed(() =>
  getButtonIconClasses(resolvedVariant.value, props.iconOnly),
)

const buttonClasses = computed(() => {
  const classes = [
    BUTTON_INTERACTION_CLASSES,
    getButtonSizeClass(props.size),
    getButtonVariantClasses(resolvedVariant.value),
    BUTTON_DISABLED_CLASSES,
  ]

  if (props.block) classes.push('w-full')
  if (isGrouped.value) {
    classes.push(BUTTON_GROUP_ITEM_CLASSES)
    classes.push(
      props.active
        ? BUTTON_GROUP_ACTIVE_CLASSES
        : BUTTON_GROUP_INACTIVE_CLASSES,
    )
  }
  if (props.buttonClass) classes.push(props.buttonClass)

  return classes
})

const onClick = (event: MouseEvent) => {
  if (isDisabled.value) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>
