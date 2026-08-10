import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
import { routes } from './routes.js'
import { clientOnlyRoutes } from './clientRoutes.js'
import { getToken, verifySession, clearSession } from '../services/authService'

export { routes, prerenderRoutes } from './routes.js'
export { clientOnlyRoutes } from './clientRoutes.js'

/** Same route table ViteSSG uses — client-only paths are always registered. */
export const allRoutes = [...routes, ...clientOnlyRoutes]

let authGuardRegistered = false

function registerAuthGuards(router) {
  if (authGuardRegistered || typeof window === 'undefined') return
  authGuardRegistered = true

  /**
   * Navigation guard for the admin area.
   *
   * `meta: { requiresAuth: true }` was already declared on the admin route but
   * nothing acted on it, so the panel was reachable by anyone who knew the URL.
   *
   * This keeps unauthenticated users off the admin screens, but it is a
   * usability control, not the security boundary: a determined visitor can
   * always run the component. The real enforcement is that every write endpoint
   * rejects requests without a valid token.
   */
  router.beforeEach(async (to) => {
    if (to.meta.requiresAuth) {
      if (!getToken()) {
        return { name: 'admin-login', query: { redirect: to.fullPath } }
      }

      const valid = await verifySession()
      if (!valid) {
        return { name: 'admin-login', query: { redirect: to.fullPath } }
      }
    }

    if (to.meta.guestOnly && getToken()) {
      return { name: 'admin' }
    }

    return true
  })

  window.addEventListener('auth:unauthorized', () => {
    clearSession()
    if (router.currentRoute.value.meta?.requiresAuth) {
      router.replace({
        name: 'admin-login',
        query: { redirect: router.currentRoute.value.fullPath }
      })
    }
  })
}

export function createAppRouter(isSSR = false) {
  const router = createRouter({
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

  if (!isSSR) {
    registerAuthGuards(router)
  }

  return router
}

export default createAppRouter()
