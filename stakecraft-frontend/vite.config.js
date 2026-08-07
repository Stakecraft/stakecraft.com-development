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
    // Pin the dev server to 5173. Without strictPort, Vite silently moves to
    // 5174/5175 when the port is busy, and the backend CORS allow-list only
    // covers 5173/5174 - so the API starts rejecting the browser with an
    // error that looks nothing like a port conflict.
    port: 5173,
    strictPort: true,
    // Bind to loopback only. Binding to 0.0.0.0 on a public VPS puts the dev
    // server, its source maps and its HMR websocket on the open internet.
    // Override deliberately with `npm run dev -- --host` when you need LAN access.
    host: '127.0.0.1',
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
