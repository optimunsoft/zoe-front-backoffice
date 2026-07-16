// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  ssr: false,
  srcDir: 'src',
  compatibilityDate: '2024-11-27',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'Zoe Backoffice',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  typescript: {
    nodeTsConfig: {
      compilerOptions: {
        types: ['node'],
      },
    },
  },

  alias: {
    '@images': fileURLToPath(new URL('./public/images', import.meta.url)),
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/image',
    '@vite-pwa/nuxt',
  ],

  // SPA sin index.html en precache: createHandlerBoundToURL('/') lanza
  // non-precached-url en producción y deja el SW inestable.
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,svg,png,ico,woff2}'],
    },
    client: {
      installPrompt: false,
    },
  },

  css: [
    '~/css/style.css',
    'vue-virtual-scroller/dist/vue-virtual-scroller.css',
  ],

  plugins: [
    '~/global/infrastructure/api/api.client.ts',
    '~/core/auth/plugins/auth-sync.client.ts',
    '~/core/auth/plugins/auth-session.client.ts',
    '~/core/auth/plugins/guest-global.client.ts',
  ],

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  runtimeConfig: {
    public: {
      API_CORE_PATH: process.env.API_CORE_PATH,
      API_BACKOFFICE_PATH: process.env.API_BACKOFFICE_PATH,
      API_VERSION: process.env.API_VERSION ?? 'v1',
      BACKEND_PATH_API: process.env.BACKEND_PATH_API,
      AUTH0_DOMAIN: process.env.AUTH0_DOMAIN ?? '',
      AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ?? '',
    },
  },

  nitro: {
    devProxy: {
      '/proxy/api-core': {
        target: 'http://192.168.1.5:9000/api',
        changeOrigin: true,
      },
      '/proxy/api-backoffice': {
        target: 'http://192.168.1.5:9002/api',
        changeOrigin: true,
      },
    },
  },
})
