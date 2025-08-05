import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
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

export default router
