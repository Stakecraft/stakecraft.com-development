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
    include: ['@cosmjs/proto-signing', '@cosmjs/amino', '@cosmjs/stargate', 'buffer', 'cosmjs-types']
  },
  build: {
    commonjsOptions: {
      include: [/cosmjs-types/, /node_modules/]
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
})
