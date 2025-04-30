import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    include: ['cosmjs-types']
  },
  build: {
    rollupOptions: {
      external: ['cosmjs-types/ethermint/types/v1/account']
    }
  },
  server: {
    proxy: {
      '/rpc': {
        target: 'https://zetachain-rpc.polkachu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc/, ''),
        secure: false
      }
    }
  }
  // server: {
  //   host: '0.0.0.0',
  //   port: 5173,
  // }
})
