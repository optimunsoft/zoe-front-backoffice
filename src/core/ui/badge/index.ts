export { default as UBadge } from './UBadge.vue'

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
