import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    global: 'globalThis'
  },
  optimizeDeps: {
    include: [
      '@cosmjs/proto-signing',
      '@cosmjs/amino',
      '@cosmjs/stargate',
      'buffer',
      'cosmjs-types'
    ]
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
      },
      '/api/health': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/health/, '/health'),
        secure: false
      }
    }
  }
})
