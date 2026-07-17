import './assets/main.css'

import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router/routes.js'
import { clientOnlyRoutes } from './router/clientRoutes.js'
import { ConfigProvider } from 'vant'

// Client-only routes must be in the initial router table. Adding them after
// ViteSSG hydrates the homepage HTML for /notadmin leaves the app on `/`.
const allRoutes = [...routes, ...clientOnlyRoutes]

export const createApp = ViteSSG(
  App,
  { routes: allRoutes },
  ({ app, router, isClient }) => {
    app.use(ConfigProvider)

    if (isClient) {
      const target =
        window.location.pathname + window.location.search + window.location.hash
      if (router.currentRoute.value.fullPath !== target) {
        router.replace(target)
      }

      // `import.meta.env.SSR` is statically replaced, so this dynamic import (and
      // the wallet-heavy StakingModals it pulls in) is dead-code-eliminated from
      // the SSR bundle and only exists in the client build.
      if (!import.meta.env.SSR) {
        import('./client/setupMainnetStaking.js').then(({ setupMainnetStaking }) => {
          setupMainnetStaking()
        })
      }
    }
  }
)
