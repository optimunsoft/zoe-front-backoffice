import {
  API_ACCOUNTING_HOST,
  API_ACCOUNTING_PROXY_PATH,
  API_CORE_HOST,
  API_CORE_PROXY_PATH,
} from '~/shared/constants/auth';

/**
 * En dev, los APIs en 192.168.1.5 se enrutan por proxy Nitro para:
 * - Evitar CORS en peticiones con Authorization
 * - Mantener cookies access_token en el mismo origen que el front
 */
function resolveDevApiProxyPath(
  configuredPath: string | undefined,
  host: string,
  proxyPath: string,
): string {
  const path = configuredPath?.trim() || '';

  if (import.meta.dev && path.includes(host)) {
    return proxyPath;
  }

  return path;
}

export function resolveApiCoreBasePath(configuredPath: string | undefined): string {
  return resolveDevApiProxyPath(configuredPath, API_CORE_HOST, API_CORE_PROXY_PATH);
}

export function resolveApiAccountingBasePath(configuredPath: string | undefined): string {
  return resolveDevApiProxyPath(configuredPath, API_ACCOUNTING_HOST, API_ACCOUNTING_PROXY_PATH);
}
