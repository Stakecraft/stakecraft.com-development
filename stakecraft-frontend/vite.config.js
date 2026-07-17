import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const prerenderRoutes = ['/', '/terms', '/policy', '/swap', '/notadmin', '/health']

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
