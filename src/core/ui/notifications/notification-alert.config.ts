import type { NotificationAlertType } from './notification-alert.types'
import type { ButtonVariant } from '~/core/ui/buttons/button.types'

export type NotificationAlertConfig = {
  label: string
  buttonVariant: ButtonVariant
  iconBgClass: string
  iconClass: string
  iconPath: string
}

export const NOTIFICATION_ALERT_CONFIG: Record<NotificationAlertType, NotificationAlertConfig> = {
  success: {
    label: 'Operación exitosa',
    buttonVariant: 'success',
    iconBgClass: 'bg-green-500/15 dark:bg-green-500/20',
    iconClass: 'text-green-500',
    iconPath: 'M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zM7 11.4L3.6 8 5 6.6l2 2 4-4L12.4 6 7 11.4z',
  },
  error: {
    label: 'Error',
    buttonVariant: 'danger',
    iconBgClass: 'bg-red-500/15 dark:bg-red-500/20',
    iconClass: 'text-red-500',
    iconPath: 'M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 10.1l-1.4 1.4L8 9.4l-2.1 2.1-1.4-1.4L6.6 8 4.5 5.9l1.4-1.4L8 6.6l2.1-2.1 1.4 1.4L9.4 8l2.1 2.1z',
  },
  warning: {
    label: 'Advertencia',
    buttonVariant: 'secondary',
    iconBgClass: 'bg-yellow-500/15 dark:bg-yellow-500/20',
    iconClass: 'text-yellow-500',
    iconPath: 'M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z',
  },
  info: {
    label: 'Información',
    buttonVariant: 'primary',
    iconBgClass: 'bg-violet-500/15 dark:bg-violet-500/20',
    iconClass: 'text-violet-500',
    iconPath: 'M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 12H7V7h2v5zM8 6c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z',
  },
}
