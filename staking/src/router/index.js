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
      path: '/terms',
      name: 'terms',
      component: async () => await import('../components/termsAndConditions/TermsAndConditions.vue')
    },
    {
      path: '/policy',
      name: 'policy',
      component: async () => await import('../components/privacyPolicy/PrivacyPolicy.vue')
    }
  ]
})

export default router
