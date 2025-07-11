import { defineConfig } from 'vite'

export default defineConfig({
  base: '/play-and-order-mock/cosmic-blaster/',
  server: {
    host: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})