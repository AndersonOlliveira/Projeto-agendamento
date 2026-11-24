
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
manifest: {
  name: 'Sistema de Agendamentos',
  short_name: 'Agendamentos',
  description: 'Sistema de agendamento de serviços.',
  theme_color: '#ffffff',
  background_color: '#ffffff',
  display: 'standalone',
  start_url: '/',
  icons: [
    {
      src: '/icons/icone_Agenda.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/icons/icone_Agenda.png',
      sizes: '512x512',
      type: 'image/png'
    }
  ]

      }
      
    })
  ],
  preview: {
    allowedHosts: [
      'partly-weblog-marie-natural.trycloudflare.com'
    ]
  }
})
