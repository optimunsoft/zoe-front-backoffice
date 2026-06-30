export { default as UBadge } from './UBadge.vue'
export { default as TableBadge } from './TableBadge.vue'

export type {
  BadgeAppearance,
  BadgeColor,
  BadgeSize,
  BadgeVariant,
} from './badge.types'

export {
  getBadgeDotClass,
  getBadgeSizeClass,
  getBadgeVariantClasses,
  resolveBadgeVariant,
} from './badge.utils'

export {
  TABLE_BADGE_APPEARANCE,
  TABLE_BADGE_PROPS,
  TABLE_BADGE_SIZE,
} from './table-badge.constants'
