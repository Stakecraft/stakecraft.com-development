import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
import { routes } from './routes.js'
import { clientOnlyRoutes } from './clientRoutes.js'

export { routes, prerenderRoutes } from './routes.js'
export { clientOnlyRoutes } from './clientRoutes.js'

/** Same route table ViteSSG uses — client-only paths are always registered. */
export const allRoutes = [...routes, ...clientOnlyRoutes]

export function createAppRouter(isSSR = false) {
  return createRouter({
    history: isSSR ? createMemoryHistory(import.meta.env.BASE_URL) : createWebHistory(import.meta.env.BASE_URL),
    routes: allRoutes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) return savedPosition

      if (to.hash) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const element = document.querySelector(to.hash)
            if (element) {
              resolve({ el: to.hash, behavior: 'smooth', top: 80 })
            } else {
              resolve({ top: 0 })
            }
          }, 100)
        })
      }

      return { top: 0, behavior: 'smooth' }
    }
  })
}

export default createAppRouter()
