import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Configure proxy for API requests to avoid CORS issues in development
    proxy: {
      // All API requests starting with /api will be proxied to Laravel backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      }
    }
  }
})