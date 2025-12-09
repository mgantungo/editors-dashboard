// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  
  runtimeConfig: {
    public: {
      strapiBaseUrl: 'https://cms-vgad.visiongroup.co.ug'
    }
  },
  
  nitro: {
    preset: 'node-server',  // Changed from 'node' to 'node-server'
    devProxy: {
      '/api': {
        target: 'https://cms-vgad.visiongroup.co.ug',
        changeOrigin: true
      }
    }
  },
  
  imports: {
    dirs: ['stores']
  },
  
  vite: {
    server: {
      allowedHosts: [
        'editor.newvision.co.ug',
        'www.editor.newvision.co.ug',
        'localhost',
        '127.0.0.1'
      ]
    }
  }
})