import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_EXPIRES_AT_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '~/shared/constants/auth';
import { removeBrowserCookie } from '~/shared/utils/cookies';

/** Limpia cookies legacy de tokens (antes duplicaban Pinia persist). */
export function clearAuthTokenCookies(): void {
  removeBrowserCookie(ACCESS_TOKEN_COOKIE);
  removeBrowserCookie(ACCESS_TOKEN_EXPIRES_AT_COOKIE);
  removeBrowserCookie(REFRESH_TOKEN_COOKIE);
}
