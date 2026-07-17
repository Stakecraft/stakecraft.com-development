import './assets/main.css'

import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes, prerenderRoutes } from './router/routes.js'
import { clientOnlyRoutes } from './router/clientRoutes.js'
import { ConfigProvider } from 'vant'

export const createApp = ViteSSG(
  App,
  { routes },
  ({ app, router, isClient }) => {
    app.use(ConfigProvider)

    if (isClient) {
      // Register client-only routes synchronously so hard-refreshing /notadmin
      // (and other non-prerendered paths) matches on first navigation.
      for (const route of clientOnlyRoutes) {
        router.addRoute(route)
      }
      if (router.currentRoute.value.matched.length === 0) {
        router.replace(router.currentRoute.value.fullPath)
      }

      // `import.meta.env.SSR` is statically replaced, so this dynamic import (and
      // the wallet-heavy StakingModals it pulls in) is dead-code-eliminated from
      // the SSR bundle and only exists in the client build.
      if (!import.meta.env.SSR) {
        import('./client/setupMainnetStaking.js').then(({ setupMainnetStaking }) => {
          setupMainnetStaking()
        })
      }

      router.beforeEach((to, from, next) => {
        if (to.meta.requiresAuth) {
          const token = localStorage.getItem('auth_token')
          if (!token) {
            next()
            return
          }
        }
        next()
      })
    }
  },
  {
    includedRoutes: () => prerenderRoutes
  }
)
