import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { getToken, verifySession, clearSession } from '../services/authService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/products',
      redirect: { path: '/', hash: '#products' }
    },
    {
      path: '/health',
      name: 'health',
      component: async () => await import('../views/HealthView.vue')
    },
    {
      path: '/terms',
      name: 'terms',
      component: async () => await import('../components/termsAndConditions/TermsAndConditions.vue')
    },
    {
      path: '/policy',
      name: 'policy',
      component: async () => await import('../components/privacyPolicy/PrivacyPolicy.vue')
    },
    {
      path: '/swap',
      name: 'swap',
      component: async () => await import('../views/Swap.vue')
    },
    {
      path: '/notadmin/login',
      name: 'admin-login',
      component: async () => await import('../views/AdminLogin.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/notadmin',
      name: 'admin',
      component: async () => await import('../views/AdminPanel.vue'),
      meta: { requiresAuth: true }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    // If there's a saved position (browser back/forward), use it
    if (savedPosition) {
      return savedPosition
    }

    // If there's a hash in the URL, scroll to that element
    if (to.hash) {
      return new Promise((resolve) => {
        // Wait for the DOM to be ready
        setTimeout(() => {
          const element = document.querySelector(to.hash)
          if (element) {
            resolve({
              el: to.hash,
              behavior: 'smooth',
              top: 80 // Offset for fixed header
            })
          } else {
            resolve({ top: 0 })
          }
        }, 100)
      })
    }

    // Default: scroll to top
    return { top: 0, behavior: 'smooth' }
  }
})

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

    // Confirm with the server that the token is still good, so a deactivated
    // or deleted account does not keep rendering the panel until its token
    // happens to expire.
    const valid = await verifySession()
    if (!valid) {
      return { name: 'admin-login', query: { redirect: to.fullPath } }
    }
  }

  // Already signed in - skip the login form.
  if (to.meta.guestOnly && getToken()) {
    return { name: 'admin' }
  }

  return true
})

// The API layer broadcasts this when a request comes back 401, which means the
// token was rejected mid-session (expired, rotated secret, disabled account).
window.addEventListener('auth:unauthorized', () => {
  clearSession()
  if (router.currentRoute.value.meta?.requiresAuth) {
    router.replace({
      name: 'admin-login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
  }
})

export default router
