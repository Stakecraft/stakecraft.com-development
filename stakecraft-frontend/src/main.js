import './assets/main.css'

import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes, prerenderRoutes } from './router/routes.js'
import { ConfigProvider } from 'vant'

export const createApp = ViteSSG(
  App,
  { routes },
  ({ app, router, isClient }) => {
    app.use(ConfigProvider)

    if (isClient) {
      import('./router/clientRoutes.js').then(({ clientOnlyRoutes }) => {
        for (const route of clientOnlyRoutes) {
          router.addRoute(route)
        }
      })

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
