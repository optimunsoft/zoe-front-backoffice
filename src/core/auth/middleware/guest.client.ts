import { defineNuxtRouteMiddleware, navigateTo } from '#imports';
import { useAuthStore } from '~/core/auth/store/auth.store';

const ROUTES = {
  INDEX: '/',
  ADMIN: '/admin',
  LOGOUT: '/logout',
  CHANGE_PASSWORD: '/change-password',
  FORGOT_PASSWORD: '/forgot-password',
};

function shouldRefreshUserProfile(
  toPath: string,
  fromPath: string,
  hasUser: boolean,
): boolean {
  if (!hasUser) {
    return true;
  }

  if (toPath.startsWith(ROUTES.ADMIN) && !fromPath.startsWith(ROUTES.ADMIN)) {
    return true;
  }

  if (toPath === ROUTES.CHANGE_PASSWORD) {
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

  if (!isAuthenticated && to.path.startsWith(ROUTES.ADMIN)) {
    return navigateTo({ path: ROUTES.INDEX });
  }

  if (isAuthenticated && to.path === ROUTES.INDEX) {
    return navigateTo(ROUTES.ADMIN);
  }

  if (
    isAuthenticated &&
    mustChangePassword &&
    to.path !== ROUTES.CHANGE_PASSWORD
  ) {
    return navigateTo(ROUTES.CHANGE_PASSWORD);
  }

  if (isAuthenticated && to.path === ROUTES.FORGOT_PASSWORD) {
    return navigateTo(ROUTES.ADMIN);
  }
});
