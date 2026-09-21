import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/aem': {
        target: 'https://publish-p221102-e2272119.adobeaemcloud.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/aem/, ''),
      },
    },
  },
})
