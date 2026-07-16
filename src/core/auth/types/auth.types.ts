import type { ApiResponse } from '~/shared/interfaces/api';

export type ProviderEnum = 'auth0';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isVerified: boolean;
  isDemo: boolean;
  countryId: string;
  provider: ProviderEnum;
  userType: string;
  backofficeRole: string;
  mustChangePassword: boolean;
}

export type GetMeResponse = ApiResponse<User | null>;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export type LoginApiResponse = ApiResponse<LoginTokens>;

export interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
  [key: string]: unknown;
}
