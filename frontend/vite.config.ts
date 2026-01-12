import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Keeps the frontend on the port you expected
  },
  build: {
    outDir: 'dist',
  }
})