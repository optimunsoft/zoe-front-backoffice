import { navigateTo } from '#imports'

/** Redirige cuando el usuario pierde acceso a la empresa en accounting. */
export async function handleRevokedCompanyAccess(): Promise<void> {
  await navigateTo('/admin')
}
