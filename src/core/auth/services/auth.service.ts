import type { GetMeResponse, LoginApiResponse, LoginRequest } from '../types/auth.types';
import { HEADER_FORCE_AUTH, HEADER_SKIP_AUTH } from '~/shared/constants/headers';

export const useAuthService = () => {
  const { $apiCore } = useNuxtApp();

  const login = (payload: LoginRequest): Promise<LoginApiResponse> => {
    return $apiCore<LoginApiResponse>('auth/login', {
      method: 'POST',
      body: payload,
      headers: { [HEADER_SKIP_AUTH]: '1' },
    });
  };

  const refresh = (token: string): Promise<LoginApiResponse> => {
    return $apiCore<LoginApiResponse>('auth/refresh', {
      method: 'POST',
      headers: { [HEADER_SKIP_AUTH]: '1' },
      body: {
        refreshToken: token,
      },
    });
  };

  const getMe = (options?: { forceAuth?: boolean }): Promise<GetMeResponse> => {
    const headers: Record<string, string> = {};
    if (options?.forceAuth) headers[HEADER_FORCE_AUTH] = '1';
    return $apiCore<GetMeResponse>('users/me', {
      method: 'GET',
      headers,
    });
  };

  const logout = (refreshToken: string): Promise<void> => {
    return $apiCore<void >('auth/logout', {
      method: 'POST',
      body: {
        refreshToken,
      },
    });
  };

  const forgotPassword = (email: string): Promise<void> => {
    return $apiCore<void>('auth/forgot-password', {
      method: 'POST',
      body: {
        email,
      },
    });
  };



  return {
    getMe,

    login,
    logout,
    forgotPassword,
    refresh,
  };
};
