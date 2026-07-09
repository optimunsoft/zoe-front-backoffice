export type NotificationEntityContext = {
  entity: string
  feminine: boolean
}

export type MutationAction = 'create' | 'update' | 'delete'

type EntityRule = {
  pattern: RegExp
  entity: string
  feminine: boolean
}

const PATH_ENTITY_RULES: EntityRule[] = [
  { pattern: /administration\/users|\/users\/(create|edit|delete)/i, entity: 'Usuario', feminine: false },
  { pattern: /administration\/modules\/[^/]+\/companies/i, entity: 'Módulo', feminine: false },
  { pattern: /administration\/companies|\/companies\/(create|edit|delete)/i, entity: 'Empresa', feminine: true },
  { pattern: /demonstrations/i, entity: 'Demostración', feminine: true },
]

type CustomSuccessMessageRule = {
  pattern: RegExp
  message: string
}

const CUSTOM_SUCCESS_MESSAGE_RULES: CustomSuccessMessageRule[] = [
  {
    pattern: /\/companies\/[^/]+\/logo$/i,
    message: 'Logo actualizado correctamente',
  },
  {
    pattern: /\/companies\/users\/assign$/i,
    message: 'Usuario administrador asignado correctamente',
  },
  {
    pattern: /\/companies\/users\/unassign$/i,
    message: 'Usuario administrador removido correctamente',
  },
  {
    pattern: /\/companies\/[^/]+\/status$/i,
    message: 'Estado de la empresa actualizado correctamente',
  },
]

const ROUTE_ENTITY_RULES: EntityRule[] = [
  { pattern: /\/usuarios/i, entity: 'Usuario', feminine: false },
  { pattern: /\/empresas/i, entity: 'Empresa', feminine: true },
  { pattern: /\/demonstrations/i, entity: 'Demostración', feminine: true },
]

const ACTION_SUFFIX: Record<MutationAction, { masculine: string; feminine: string }> = {
  create: { masculine: 'creado', feminine: 'creada' },
  update: { masculine: 'actualizado', feminine: 'actualizada' },
  delete: { masculine: 'eliminado', feminine: 'eliminada' },
}

const matchEntityRule = (rules: EntityRule[], value: string) =>
  rules.find((rule) => rule.pattern.test(value))

export const resolveNotificationEntity = (
  requestUrl: string,
  routePath?: string,
): NotificationEntityContext | null => {
  const pathMatch = matchEntityRule(PATH_ENTITY_RULES, requestUrl)
  if (pathMatch) {
    return { entity: pathMatch.entity, feminine: pathMatch.feminine }
  }

  if (routePath) {
    const routeMatch = matchEntityRule(ROUTE_ENTITY_RULES, routePath)
    if (routeMatch) {
      return { entity: routeMatch.entity, feminine: routeMatch.feminine }
    }
  }

  return null
}

export const resolveMutationAction = (
  method: string,
  requestUrl: string,
): MutationAction | null => {
  const normalizedMethod = method.toUpperCase()

  if (normalizedMethod === 'DELETE' || /\/delete(?:\/|$)/i.test(requestUrl)) {
    return 'delete'
  }

  if (normalizedMethod === 'PUT' || normalizedMethod === 'PATCH' || /\/edit(?:\/|$)/i.test(requestUrl)) {
    return 'update'
  }

  if (normalizedMethod === 'POST' || /\/create(?:\/|$)/i.test(requestUrl)) {
    return 'create'
  }

  return null
}

export const buildContextualSuccessMessage = (
  action: MutationAction,
  context: NotificationEntityContext,
): string => {
  const suffix = context.feminine
    ? ACTION_SUFFIX[action].feminine
    : ACTION_SUFFIX[action].masculine

  return `${context.entity} ${suffix} correctamente`
}

const resolveCustomSuccessMessage = (requestUrl: string) =>
  CUSTOM_SUCCESS_MESSAGE_RULES.find((rule) => rule.pattern.test(requestUrl))?.message ?? null

export const resolveContextualSuccessMessage = (
  method: string,
  requestUrl: string,
  routePath?: string,
): string | null => {
  const customMessage = resolveCustomSuccessMessage(requestUrl)
  if (customMessage) return customMessage

  const action = resolveMutationAction(method, requestUrl)
  const entity = resolveNotificationEntity(requestUrl, routePath)

  if (!action || !entity) return null

  return buildContextualSuccessMessage(action, entity)
}
