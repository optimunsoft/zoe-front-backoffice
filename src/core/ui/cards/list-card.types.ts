export type UListCardBadgeTone = 'featured' | 'default' | 'success' | 'warning' | 'danger' | 'info'

export type UListCardItem = {
  title: string
  description?: string
  to?: string
  image?: string
  imageAlt?: string
  badge?: string
  badgeTone?: UListCardBadgeTone
  favorited?: boolean
}
