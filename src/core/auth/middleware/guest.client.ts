import { defineNuxtRouteMiddleware, navigateTo } from '#imports';
import { useAuthStore } from '~/core/auth/store/auth.store';

const ROUTES = {
  INDEX: '/',
  DASHBOARD: '/dashboard/544987',
  LOGOUT: '/logout',
};

function shouldRefreshUserProfile(
  toPath: string,
  fromPath: string,
  hasUser: boolean,
): boolean {
  if (!hasUser) {
    return true;
  }

  if (toPath.startsWith(ROUTES.DASHBOARD) && !fromPath.startsWith(ROUTES.DASHBOARD)) {
    return true;
  }


  return false;
}

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.path === ROUTES.LOGOUT) return;

  const authStore = useAuthStore();

  if (authStore.isLoggedIn && !authStore.hasValidAccessToken()) {
    const token = await authStore.ensureAccessToken();
    if (!token) {
      await authStore.logout();
    }
  }

  const isAuthenticated = authStore.hasValidSession();
  const mustChangePassword = authStore.user?.mustChangePassword;

  if (
    isAuthenticated &&
    shouldRefreshUserProfile(to.path, from.path, Boolean(authStore.user))
  ) {
    try {
      await authStore.getMe({ forceAuth: true });
    } catch {
      await authStore.logout();
      return navigateTo({ path: ROUTES.INDEX });
    }
  }

  if (!isAuthenticated && to.path.startsWith(ROUTES.DASHBOARD)) {
    return navigateTo({ path: ROUTES.INDEX });
  }

  if (isAuthenticated && to.path === ROUTES.INDEX) {
    return navigateTo(ROUTES.DASHBOARD);
  }

});
