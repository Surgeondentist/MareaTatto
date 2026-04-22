import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    proxy: {
      '/api/reviews': {
        target: 'https://www.mareatattoo.shop',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        beneficioExpresion: resolve(__dirname, 'beneficio-expresion.html'),
        beneficioSanacion: resolve(__dirname, 'beneficio-sanacion.html'),
        beneficioPsicologico: resolve(__dirname, 'beneficio-psicologico.html'),
        privacy: resolve(__dirname, 'privacy.html'),
      }
    }
  }
})
