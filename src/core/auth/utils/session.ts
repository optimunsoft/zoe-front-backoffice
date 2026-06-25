import type { JWTPayload } from "../types/auth.types";
import { jwtDecode } from "jwt-decode";

const TOKEN_EXPIRY_BUFFER_MS = 30_000;

/** Obtiene el tiempo de expiración del access token en milisegundos. */

export const getAccessTokenExpirationMs = (token: string): number | null => {
    try {
      const { exp } = jwtDecode<JWTPayload>(token);
      if (typeof exp !== 'number' || !Number.isFinite(exp)) {
        return null;
      }
  
      return exp * 1000;
    } catch {
      return null;
    }
  };


  export const isAccessTokenExpired = (token: string): boolean => {
    const expiresAtMs = getAccessTokenExpirationMs(token);
    if (expiresAtMs == null) {
      return true;
    }
  
    return Date.now() >= expiresAtMs - TOKEN_EXPIRY_BUFFER_MS;
  };