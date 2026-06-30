import { defineNuxtRouteMiddleware, navigateTo } from '#imports';
import { useAuthStore } from '~/core/auth/store/auth.store';

export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore();

  if (!authStore.hasValidSession()) {
    return navigateTo('/login');
  }

  if (!authStore.user) {
    try {
      await authStore.getMe({ forceAuth: true });
    } catch {
      return navigateTo('/login');
    }
  }

  if (!authStore.isAdminUser) {
    return navigateTo('/backoffice/dashboard');
  }
});
