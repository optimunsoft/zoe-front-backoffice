import { clearAuthTokenCookies } from '~/core/auth/utils/auth-token-cookies';

/** Sesión en Pinia persist (localStorage). Quita cookies legacy de tokens al iniciar. */
export default defineNuxtPlugin(() => {
  clearAuthTokenCookies();
});
