import { defineNuxtRouteMiddleware, navigateTo } from '#imports';
import { useAuthStore } from '~/core/auth/store/auth.store';

const ROUTES = {
  INDEX: '/',
  LOGIN: '/login',
  BACKOFFICE: '/backoffice',
  DASHBOARD: '/backoffice/dashboard',
  LOGOUT: '/logout',
};

function isLoginRoute(path: string): boolean {
  return path === ROUTES.INDEX || path === ROUTES.LOGIN;
}

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

function isBackofficeRoute(path: string): boolean {
  return path === ROUTES.BACKOFFICE || path.startsWith(`${ROUTES.BACKOFFICE}/`);
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

  if (
    isAuthenticated &&
    shouldRefreshUserProfile(to.path, from.path, Boolean(authStore.user))
  ) {
    try {
      await authStore.getMe({ forceAuth: true });
    } catch {
      await authStore.logout();
      return navigateTo({ path: ROUTES.LOGIN });
    }
  }

  if (!isAuthenticated && isBackofficeRoute(to.path)) {
    return navigateTo({ path: ROUTES.LOGIN });
  }

  if (isAuthenticated && isLoginRoute(to.path)) {
    return navigateTo(ROUTES.DASHBOARD);
  }

  if (isAuthenticated && to.path === ROUTES.BACKOFFICE) {
    return navigateTo(ROUTES.DASHBOARD);
  }

});
