/*
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
*/

// nuxt.config.ts - Most maintainable
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@pinia/nuxt', // Make sure this is included
    '@nuxtjs/tailwindcss'
  ],
  
  runtimeConfig: {
    public: {
      strapiBaseUrl: 'https://cms-vgad.visiongroup.co.ug'
    }
  },
  
  nitro: {
    preset: 'node',
    devProxy: {
      '/api': {
        target: 'https://cms-vgad.visiongroup.co.ug',
        changeOrigin: true
      }
    }
  },
  
  imports: {
    dirs: ['stores'] // Make sure this is included
  }
})