export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  nitro: {
    preset: 'node',
    devProxy: {},
  },
  imports: {
    dirs: ['stores']
  }
})


