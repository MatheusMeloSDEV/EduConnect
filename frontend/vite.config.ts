import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true, // Listen on all local IPs to allow mobile testing
  },
  build: {
    outDir: 'dist',
  }
})