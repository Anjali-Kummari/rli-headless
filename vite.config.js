import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
 
export default defineConfig({
  plugins: [react()],
 
  server: {
    proxy: {
      '/aem': {
        target: 'http://dxpvm.eastus.cloudapp.azure.com:4503',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/aem/, ''),
      },
    },
  },
})