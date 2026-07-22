import type { BadgeColor } from '~/core/ui/badge/badge.types'

import type { UListCardBadgeTone } from './list-card.types'

export const getListCardBadgeColor = (tone: UListCardBadgeTone = 'default'): BadgeColor => {
  switch (tone) {
    case 'featured':
    case 'warning':
      return 'warning'
    case 'success':
      return 'success'
    case 'danger':
      return 'danger'
    case 'info':
      return 'info'
    case 'default':
    default:
      return 'neutral'
  }
}
