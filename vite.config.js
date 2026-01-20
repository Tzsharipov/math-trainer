import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        basics: resolve(__dirname, 'basics.html'),
        multiplication: resolve(__dirname, 'multiplication.html'),
        division: resolve(__dirname, 'division.html'),
      },
    },
  },
  server: {
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true
    }
  }
})
