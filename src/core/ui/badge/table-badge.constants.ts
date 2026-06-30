import type { BadgeAppearance, BadgeSize } from './badge.types'

export const TABLE_BADGE_APPEARANCE: BadgeAppearance = 'soft'

export const TABLE_BADGE_SIZE: BadgeSize = 'md'

export const TABLE_BADGE_PROPS = {
  appearance: TABLE_BADGE_APPEARANCE,
  size: TABLE_BADGE_SIZE,
  pill: true,
} as const
