import { defineStore } from 'pinia';
import { ref } from 'vue';

import { useAuthService } from '../services/auth.service';
import { clearAuthTokenCookies } from '../utils/auth-token-cookies';
import { getAccessTokenExpirationMs, isAccessTokenExpired } from '../utils/session';

export const useAuthSessionStore = defineStore(
  'authSession',
  () => {
    const getAuthSvc = () => useAuthService();

    const accessToken = ref<string | null>(null);
    const refreshToken = ref<string | null>(null);
    const tokenExpiresAt = ref<number | null>(null);

    let refreshAccessTokenInFlight: Promise<void> | null = null;

    const setAuthTokens = (token: string, refresh: string, expiresIn: number) => {
      accessToken.value = token;
      refreshToken.value = refresh?.trim() ? refresh : null;

      const jwtExpiresAtMs = getAccessTokenExpirationMs(token);
      if (jwtExpiresAtMs != null) {
        tokenExpiresAt.value = jwtExpiresAtMs;
        return;
      }

      const expiresInSeconds = Number(expiresIn);
      const safeExpiresInSeconds =
        Number.isFinite(expiresInSeconds) && expiresInSeconds > 0 ? expiresInSeconds : 3600;

      tokenExpiresAt.value = Date.now() + safeExpiresInSeconds * 1000;
    };

    const setAccessToken = (token: string, expiresIn: number) => {
      setAuthTokens(token, refreshToken.value ?? '', expiresIn);
    };

    const clearAuthTokens = () => {
      accessToken.value = null;
      refreshToken.value = null;
      tokenExpiresAt.value = null;
      clearAuthTokenCookies();
    };

    const hasValidAccessToken = (): boolean => {
      const token = accessToken.value?.trim();
      if (!token) return false;
      return !isAccessTokenExpired(token);
    };

    const refreshAccessToken = async () => {
      const { response } = await getAuthSvc().refresh(refreshToken.value ?? '');
      if (!response?.accessToken?.trim()) {
        throw new Error('La respuesta de refresh no incluye accessToken');
      }
      setAuthTokens(response.accessToken, response.refreshToken ?? '', response.expiresIn);
    };

    const ensureAccessToken = async (): Promise<string | null> => {
      const token = accessToken.value?.trim();
      if (!token) return null;

      if (!isAccessTokenExpired(token)) {
        return token;
      }

      if (!refreshAccessTokenInFlight) {
        refreshAccessTokenInFlight = refreshAccessToken().finally(() => {
          refreshAccessTokenInFlight = null;
        });
      }

      try {
        await refreshAccessTokenInFlight;
        return accessToken.value?.trim() ?? null;
      } catch {
        return null;
      }
    };

    return {
      accessToken,
      refreshToken,
      tokenExpiresAt,
      setAuthTokens,
      setAccessToken,
      clearAuthTokens,
      hasValidAccessToken,
      refreshAccessToken,
      ensureAccessToken,
    };
  },
  {
    persist: {
      pick: ['accessToken', 'refreshToken', 'tokenExpiresAt'],
    },
  },
);
