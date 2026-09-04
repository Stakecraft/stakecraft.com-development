import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const prerenderRoutes = [
  '/',
  '/terms',
  '/policy',
  '/swap',
  '/solana-staking',
  '/near-staking',
  '/monad-staking',
  '/notadmin',
  '/health'
]

export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills({
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
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Keep JPool (+ its stake-pool fork) out of vendor-wallets — bundling
            // them with @solana/* previously caused TDZ / dead hydration on SSG.
            if (id.includes('@jpool')) {
              return 'vendor-jpool'
            }
            if (
              id.includes('@solana') ||
              id.includes('@cosmjs') ||
              id.includes('@polkadot') ||
              id.includes('@near-wallet') ||
              id.includes('near-api-js') ||
              id.includes('@mysten/sui') ||
              id.includes('ethers') ||
              id.includes('web3')
            ) {
              return 'vendor-wallets'
            }
            if (id.includes('vant')) return 'vendor-vant'
            if (id.includes('vue') || id.includes('@vue')) return 'vendor-vue'
            return 'vendor'
          }
          if (id.includes('/components/stakingViews/')) {
            return 'staking-modals'
          }
        }
      }
    }
  },
  ssr: {
    noExternal: [
      '@cosmjs/encoding',
      '@cosmjs/stargate',
      '@cosmjs/proto-signing',
      '@cosmjs/amino',
      'cosmjs-types'
    ]
  },
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    beastiesOptions: {
      reduceInlineStyles: false
    },
    includedRoutes(paths) {
      const allow = new Set(prerenderRoutes)
      return paths.filter((path) => allow.has(path))
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
