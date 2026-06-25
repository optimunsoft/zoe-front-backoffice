export type ApiClient = ReturnType<typeof $fetch.create>

/** Subconjunto de NuxtApp usado por el cliente HTTP. */
export type ApiPluginNuxtApp = {
  runWithContext: <T>(fn: () => T) => T | Promise<T>
  $authSync?: { broadcastLogout?: () => void }
}

declare module '#app' {
  interface NuxtApp {
    $apiCore: ApiClient
    $apiAccounting: ApiClient
    $authSync?: { broadcastLogout?: () => void }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $apiCore: ApiClient
    $apiAccounting: ApiClient
    $authSync?: { broadcastLogout?: () => void }
  }
}

export {}
