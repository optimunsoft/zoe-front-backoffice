<template>
  <div
    class="rounded-xl bg-white px-5 py-4 shadow-xs dark:bg-gray-800"
    :class="[cardClass, isClickable ? 'cursor-pointer' : '']"
    :role="isClickable ? 'button' : undefined"
    :tabindex="isClickable ? 0 : undefined"
    @click="onCardClick"
    @keydown.enter.prevent="onCardClick"
    @keydown.space.prevent="onCardClick"
  >
    <div class="items-center justify-between space-y-4 md:flex md:space-y-0 md:space-x-2">
      <div class="flex items-start space-x-3 md:space-x-4">
        
        <div class="mt-1 size-9 shrink-0">
          <slot name="leading">
            <img
              v-if="image"
              class="size-9 rounded-full object-cover"
              :src="image"
              width="36"
              height="36"
              :alt="imageAlt || title"
            >
            <div
              v-else-if="icon"
              class="flex size-9 items-center justify-center rounded-full bg-brand-500/15 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300"
            >
              <UiIcon :name="icon" size="sm" />
            </div>
          </slot>
        </div>

        <div class="min-w-0">
          <component
            :is="to ? 'router-link' : 'p'"
            v-bind="to ? { to } : undefined"
            class="inline-flex font-semibold text-gray-800 dark:text-gray-100"
            :class="to ? 'hover:text-brand-600 dark:hover:text-brand-300' : ''"
          >
            {{ title }}
          </component>
          <div
            v-if="description || $slots.description"
            class="text-sm text-gray-500 dark:text-gray-400"
          >
            <slot name="description">
              {{ description }}
            </slot>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-4 pl-10 md:pl-0">
        <slot name="meta" />

        <UBadge
          v-if="badge"
          :color="resolvedBadgeColor"
          appearance="soft"
          size="sm"
        >
          {{ badge }}
        </UBadge>

        <button
          v-if="showFavorite"
          type="button"
          class="transition"
          :class="favorited
            ? 'text-yellow-500'
            : 'text-gray-300 hover:text-gray-400 dark:text-gray-600 dark:hover:text-gray-500'"
          :aria-pressed="favorited"
          @click.stop="emit('toggle-favorite')"
        >
          <span class="sr-only">{{ favorited ? 'Quitar de favoritos' : 'Marcar como favorito' }}</span>
          <svg class="h-4 w-3 fill-current" width="12" height="16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M2 0C.9 0 0 .9 0 2v14l6-3 6 3V2c0-1.1-.9-2-2-2H2Z" />
          </svg>
        </button>

        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { UBadge } from '~/core/ui/badge'
import type { BadgeColor } from '~/core/ui/badge/badge.types'
import { UiIcon } from '~/core/ui/icons'
import type { UiIconName } from '~/core/ui/icons'

import type { UListCardBadgeTone } from './list-card.types'
import { getListCardBadgeColor } from './list-card.utils'

const props = withDefaults(defineProps<{
  title: string
  description?: string
  to?: string
  image?: string
  imageAlt?: string
  icon?: UiIconName
  badge?: string
  badgeTone?: UListCardBadgeTone
  badgeColor?: BadgeColor
  favorited?: boolean
  showFavorite?: boolean
  cardClass?: string
  clickable?: boolean
}>(), {
  description: '',
  to: undefined,
  image: undefined,
  imageAlt: '',
  icon: undefined,
  badge: undefined,
  badgeTone: 'default',
  badgeColor: undefined,
  favorited: false,
  showFavorite: false,
  cardClass: '',
  clickable: false,
})

const emit = defineEmits<{
  'toggle-favorite': []
  click: []
}>()

const isClickable = computed(() => props.clickable || !props.to)

const onCardClick = () => {
  if (!isClickable.value) return
  emit('click')
}

const resolvedBadgeColor = computed(() =>
  props.badgeColor ?? getListCardBadgeColor(props.badgeTone),
)
</script>
