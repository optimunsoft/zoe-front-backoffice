export function getRequestUrl(request: unknown): string {
  if (typeof request === 'string') {
    return request;
  }

  if (request instanceof Request) {
    return request.url;
  }

  if (request && typeof request === 'object' && 'url' in request) {
    const url = (request as { url: unknown }).url;
    if (typeof url === 'string') {
      return url;
    }
  }

  return '';
}

export function isAuthRefreshRequest(request: unknown): boolean {
  return getRequestUrl(request).includes('auth/refresh');
}
