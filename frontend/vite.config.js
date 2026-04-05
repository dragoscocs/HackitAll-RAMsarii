import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'EcoSync Corporate Wellbeing',
          short_name: 'EcoSync',
          description: 'AI-powered wellbeing ecosystem',
          theme_color: '#18181b',
          background_color: '#000000',
          display: 'standalone',
          icons: [
            {
              src: '/logo.png',
              sizes: '192x192 512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],
    server: {
      port: 5173,
      allowedHosts: ['.trycloudflare.com', '.loca.lt', '.serveo.net'],
      proxy: {
        '/api': {
          target: env.BACKEND_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
