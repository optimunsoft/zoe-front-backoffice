import { addRouteMiddleware, defineNuxtPlugin } from 'nuxt/app';
import guest from '~/core/auth/middleware/guest.client';

export default defineNuxtPlugin(() => {
  addRouteMiddleware('guest', guest, { global: true });
});
