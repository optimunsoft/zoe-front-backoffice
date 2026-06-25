// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  ssr: false,
  srcDir: 'src',
  compatibilityDate: '2024-11-27',
  devtools: { enabled: true },

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
      API_ACCOUNTING_PATH: process.env.API_ACCOUNTING_PATH,
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
        target: 'http://localhost:9000/api',
        changeOrigin: true,
      },
      '/proxy/api-accounting': {
        target: 'http://localhost:9001/api',
        changeOrigin: true,
      },
    },
  },
})
