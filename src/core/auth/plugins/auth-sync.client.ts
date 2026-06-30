import { defineNuxtPlugin } from 'nuxt/app';
import { useAuthStore } from '~/core/auth/store/auth.store';

const CHANNEL_NAME = 'auth-sync-channel';
const STORAGE_KEY = 'auth-sync-event';

type AuthSyncEvent = { type: 'logout'; ts: number };

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();

  // BroadcastChannel para sincronizar entre pestañas modernas
  let channel: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener('message', async (ev: MessageEvent<AuthSyncEvent>) => {
      if (ev.data?.type === 'logout') {
        await authStore.logout();
        navigateTo('/login');
      }
    });
  }

  // Fallback: storage event para navegadores sin BroadcastChannel
  window.addEventListener('storage', async (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue) as AuthSyncEvent;
        if (payload.type === 'logout') {
          await authStore.logout();
          navigateTo('/login');
        }
      } catch {}
    }
  });

  // Expone un método para emitir logout a otras pestañas
  return {
    provide: {
      authSync: {
        broadcastLogout: () => {
          const event: AuthSyncEvent = { type: 'logout', ts: Date.now() };
          if (channel) channel.postMessage(event);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(event));
            // Limpia para no llenar el storage
            localStorage.removeItem(STORAGE_KEY);
          } catch {}
        },
      },
    },
  };
});


