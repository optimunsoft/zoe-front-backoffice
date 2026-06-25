export function removeBrowserCookie(name: string): void {
  if (!import.meta.client) {
    return
  }

  document.cookie = `${name}=; Max-Age=0; path=/`
}
